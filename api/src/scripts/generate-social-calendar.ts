/**
 * Generate a 30-day FB+IG social calendar for any client via Claude Haiku.
 *
 * Usage:
 *   tsx src/scripts/generate-social-calendar.ts <brand-profile.json> <month> [output.json]
 *
 * Example:
 *   tsx src/scripts/generate-social-calendar.ts \
 *     ../clients/aditis/kitchen/brand-profile.json 2026-06
 *
 * Writes the agent-team's social-calendar.json shape. ANTHROPIC_API_KEY must
 * be set in .env. Without it the script throws ServiceError("anthropic",
 * "missing-key") — no silent dry-run, because the whole point is to actually
 * call Claude.
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { runAgent } from "@/services/anthropic";
import { log } from "@/lib/logger";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));

const SOCIAL_CALENDAR_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["client_id", "month", "post_count", "channel_mix", "posts"],
  properties: {
    client_id: { type: "string" },
    month: { type: "string", description: "YYYY-MM" },
    post_count: { type: "integer" },
    active_cultural_hooks: { type: "array", items: { type: "string" } },
    channel_mix: {
      type: "object",
      additionalProperties: false,
      required: ["fb", "ig"],
      properties: {
        fb: { type: "integer" },
        ig: { type: "integer" },
      },
    },
    posts: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["slot_id", "scheduled_for", "channels", "kind", "needs_image_from_intake"],
        properties: {
          slot_id: { type: "string" },
          scheduled_for: { type: "string", description: "ISO 8601 with timezone offset" },
          channels: {
            type: "array",
            items: { type: "string", enum: ["fb", "ig"] },
          },
          kind: {
            type: "string",
            enum: [
              "signature_item",
              "cultural_hook",
              "promo",
              "behind_the_scenes",
              "review_spotlight",
              "location_or_team",
              "reel",
            ],
          },
          topic: { type: "string" },
          caption_fb: { type: "string" },
          caption_ig: { type: "string" },
          hashtags_ig: { type: "array", items: { type: "string" } },
          image_brief: { type: "string" },
          needs_image_from_intake: { type: "boolean" },
          cta: { type: "string" },
          operator_fillins: { type: "array", items: { type: "string" } },
        },
      },
    },
    notes_for_operator: { type: "array", items: { type: "string" } },
  },
};

async function main(): Promise<void> {
  const [brandProfilePath, month, outputArg] = process.argv.slice(2);
  if (!brandProfilePath || !month) {
    console.error("Usage: tsx generate-social-calendar.ts <brand-profile.json> <month> [output.json]");
    process.exit(2);
  }
  if (!/^\d{4}-\d{2}$/.test(month)) {
    console.error("month must be YYYY-MM");
    process.exit(2);
  }

  const resolvedBrand = path.resolve(scriptDir, "..", "..", brandProfilePath);
  const brandProfile = JSON.parse(await readFile(resolvedBrand, "utf-8")) as Record<string, unknown>;
  const clientId = String(brandProfile["client_id"] ?? "unknown-client");

  const defaultOut = path.resolve(
    path.dirname(resolvedBrand),
    "campaigns",
    month,
    "social-calendar.generated.json",
  );
  const outputPath = outputArg ? path.resolve(scriptDir, "..", "..", outputArg) : defaultOut;

  log.info("generate-social-calendar.start", { brandProfilePath: resolvedBrand, month, clientId, outputPath });

  const result = await runAgent<Record<string, unknown>>({
    agentName: "social-media-planner",
    brandProfile,
    month,
    task: `Produce the 30-day FB+IG social calendar for ${clientId} for ${month}. Default 12 slots per the playbook (3 signature_item / 2 cultural_hook / 2 promo / 1 behind_the_scenes / 1 review_spotlight / 1 location_or_team / 1 reel / 1 gbp). Every post needs_image_from_intake: true unless the post can run text-only on FB. Captions must obey brand_profile.do_not_say strictly. Hashtags only on IG, 5-10 per post.`,
    outputSchema: SOCIAL_CALENDAR_SCHEMA,
  });

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, JSON.stringify(result.output, null, 2) + "\n", "utf-8");

  log.info("generate-social-calendar.done", {
    clientId,
    month,
    outputPath,
    costCents: result.costCents,
    cacheHitRate: result.cacheHitRate,
    requestId: result.requestId,
  });
}

main().catch((err: unknown) => {
  log.error("generate-social-calendar.failed", { error: err instanceof Error ? err.message : String(err) });
  process.exit(1);
});
