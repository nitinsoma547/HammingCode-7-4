/**
 * Agent runner — the bridge from .claude/agents/*.md to production runtime.
 *
 * One invocation:
 *   1. Loads the agent's prompt body from .claude/agents/<name>.md (strips YAML front matter).
 *   2. Builds a Haiku request with prompt caching on the stable parts:
 *      - tools (none for now)
 *      - system block 1: agent prompt body (cached, stable across months)
 *      - first user block: brand profile JSON (cached, stable across the client's month)
 *      - subsequent user blocks: month + intake + task instruction (volatile)
 *   3. Asks for structured JSON output via output_config.format.
 *   4. Validates the model returned valid JSON against the schema.
 *   5. Computes the cost in cents and the cache hit rate.
 *
 * Why this design hits the >70% cache hit target:
 *   - Render order is tools -> system -> messages, so the agent prompt and
 *     brand profile (both stable) sit at the front of the prefix.
 *   - Volatile inputs (month, intake, task) come after the last cache_control
 *     breakpoint. Changing them does not invalidate the prefix.
 *   - All input JSON is stringified with sorted keys so byte-for-byte identical
 *     brand profiles produce identical prefixes (silent invalidator audit).
 */

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Anthropic from "@anthropic-ai/sdk";
import type { Message } from "@anthropic-ai/sdk/resources/messages";

import { config } from "@/lib/config";
import { ServiceError } from "@/lib/errors";
import { log } from "@/lib/logger";
import {
  HAIKU_CACHE_READ_PER_MTOK_CENTS,
  HAIKU_CACHE_WRITE_PER_MTOK_CENTS,
  HAIKU_INPUT_PER_MTOK_CENTS,
  HAIKU_OUTPUT_PER_MTOK_CENTS,
  type AgentRunInput,
  type AgentRunResult,
} from "./types";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../..");
const AGENTS_DIR = path.join(REPO_ROOT, ".claude", "agents");

let _client: Anthropic | null = null;
function client(): Anthropic {
  if (_client) return _client;
  if (!config.anthropic.apiKey) {
    throw new ServiceError("anthropic", "missing-key", "ANTHROPIC_API_KEY not set. See .env.example.");
  }
  _client = new Anthropic({ apiKey: config.anthropic.apiKey });
  return _client;
}

/** Strip the YAML front matter (between leading `---` blocks) and return the body. */
function stripFrontMatter(raw: string): string {
  if (!raw.startsWith("---")) return raw;
  const end = raw.indexOf("\n---", 3);
  if (end < 0) return raw;
  return raw.slice(end + 4).replace(/^\n+/, "");
}

/** Deterministic JSON stringify with sorted keys — guards prompt-cache hits. */
function stableStringify(value: unknown): string {
  const seen = new WeakSet<object>();
  const helper = (v: unknown): unknown => {
    if (v === null || typeof v !== "object") return v;
    if (seen.has(v as object)) return "[circular]";
    seen.add(v as object);
    if (Array.isArray(v)) return v.map(helper);
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(v as Record<string, unknown>).sort()) {
      out[k] = helper((v as Record<string, unknown>)[k]);
    }
    return out;
  };
  return JSON.stringify(helper(value), null, 2);
}

function computeCostCents(usage: AgentRunResult<unknown>["usage"]): number {
  const inputCents = (usage.input_tokens / 1_000_000) * HAIKU_INPUT_PER_MTOK_CENTS;
  const outputCents = (usage.output_tokens / 1_000_000) * HAIKU_OUTPUT_PER_MTOK_CENTS;
  const writeCents = (usage.cache_creation_input_tokens / 1_000_000) * HAIKU_CACHE_WRITE_PER_MTOK_CENTS;
  const readCents = (usage.cache_read_input_tokens / 1_000_000) * HAIKU_CACHE_READ_PER_MTOK_CENTS;
  return Math.round((inputCents + outputCents + writeCents + readCents) * 100) / 100;
}

export async function runAgent<TOutput = unknown>(
  input: AgentRunInput<TOutput>,
): Promise<AgentRunResult<TOutput>> {
  const agentPath = path.join(AGENTS_DIR, `${input.agentName}.md`);
  let agentMd: string;
  try {
    agentMd = await readFile(agentPath, "utf-8");
  } catch (err) {
    throw new ServiceError("anthropic", "agent-not-found", `Could not read ${agentPath}`, err);
  }
  const agentPromptBody = stripFrontMatter(agentMd);

  const brandProfileJson = stableStringify(input.brandProfile);
  const intakeJson = input.monthlyIntake !== undefined
    ? stableStringify(input.monthlyIntake)
    : "(no monthly_intake supplied — assume no special promotions or events this month)";
  const additionalContextJson = input.additionalContext !== undefined
    ? stableStringify(input.additionalContext)
    : null;

  const ant = client();
  const model = config.anthropic.model;

  const response = (await ant.messages.create({
    model,
    max_tokens: 16000,
    system: [
      {
        type: "text",
        text: agentPromptBody,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `# Client brand_profile\n\n\`\`\`json\n${brandProfileJson}\n\`\`\``,
            cache_control: { type: "ephemeral" },
          },
          {
            type: "text",
            text: `# Month\n\n${input.month}\n\n# Monthly intake\n\n\`\`\`json\n${intakeJson}\n\`\`\`${
              additionalContextJson
                ? `\n\n# Additional upstream context\n\n\`\`\`json\n${additionalContextJson}\n\`\`\``
                : ""
            }\n\n# Task\n\n${input.task}\n\nReturn JSON only, conforming to the supplied schema. No prose, no markdown fences.`,
          },
        ],
      },
    ],
    output_config: {
      format: {
        type: "json_schema",
        schema: input.outputSchema as Record<string, unknown>,
      },
    },
  } as Parameters<typeof ant.messages.create>[0])) as Message & { _request_id?: string | null };

  const usage = response.usage as AgentRunResult<unknown>["usage"];
  const totalInput = usage.input_tokens + usage.cache_read_input_tokens + usage.cache_creation_input_tokens;
  const cacheHitRate = totalInput > 0 ? usage.cache_read_input_tokens / totalInput : 0;
  const costCents = computeCostCents(usage);

  const textBlock = response.content.find((b: Message["content"][number]) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new ServiceError("anthropic", "no-text-block", `No text block in response from ${input.agentName}`);
  }
  let parsed: TOutput;
  try {
    parsed = JSON.parse(textBlock.text) as TOutput;
  } catch (err) {
    throw new ServiceError(
      "anthropic",
      "non-json-response",
      `Agent ${input.agentName} returned non-JSON output: ${textBlock.text.slice(0, 200)}`,
      err,
    );
  }

  const requestId = (response as unknown as { _request_id?: string })._request_id;
  log.info("anthropic.agent.ran", {
    agent: input.agentName,
    model,
    cacheHitRate: Math.round(cacheHitRate * 100) / 100,
    costCents,
    usage,
    requestId,
  });

  return {
    agent: input.agentName,
    model,
    output: parsed,
    usage,
    costCents,
    cacheHitRate,
    ...(requestId ? { requestId } : {}),
  };
}
