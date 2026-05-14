/**
 * FAL.AI client for Kling 3.0 image-to-video.
 *
 * Endpoint: POST /fal-ai/kling-video/v1/standard/image-to-video
 * Auth: API key header. Async job model — submit returns job id,
 * poll status endpoint until completed.
 *
 * Uses the @fal-ai/client package per CLAUDE.md §13 (the older
 * @fal-ai/serverless-client is deprecated — do not import it).
 *
 * Why a raw fetch implementation here vs. the SDK: keeps the api/
 * dependency surface small. When we install @fal-ai/client we'll
 * swap submit() to use it; the poll loop and types stay the same.
 */

import { config } from "@/lib/config";
import { ServiceError } from "@/lib/errors";
import { log } from "@/lib/logger";
import type { KlingJobResult, KlingJobSpec } from "./types";

const FAL_BASE = "https://fal.run";
const FAL_MODEL = "fal-ai/kling-video/v1/standard/image-to-video";
const POLL_INTERVAL_MS = 5_000;
const MAX_WAIT_MS = 10 * 60_000; // Kling typically returns < 5 min

function requireFalKey(): string {
  if (!config.fal.apiKey) {
    throw new ServiceError("fal", "missing-key", "FAL_KEY not set. See .env.example.");
  }
  return config.fal.apiKey;
}

async function sleep(ms: number): Promise<void> {
  await new Promise((r) => setTimeout(r, ms));
}

interface FalSubmitResponse {
  request_id: string;
  status: string;
  response_url?: string;
  status_url?: string;
}

interface FalStatusResponse {
  status: "IN_QUEUE" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
  response_url?: string;
}

interface FalResultResponse {
  video?: { url: string };
}

function costForDuration(seconds: 5 | 10): number {
  return seconds === 5 ? 50 : 100;
}

export async function submitKlingJob(
  spec: KlingJobSpec,
  options: { dryRun?: boolean } = {},
): Promise<KlingJobResult> {
  if (options.dryRun) {
    log.info("fal.dry-run", { spec });
    return {
      jobId: "dry-run",
      status: "submitted",
      costCents: costForDuration(spec.durationSeconds),
    };
  }

  const apiKey = requireFalKey();
  const response = await fetch(`${FAL_BASE}/${FAL_MODEL}`, {
    method: "POST",
    headers: {
      "Authorization": `Key ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      image_url: spec.imageUrl,
      prompt: spec.prompt,
      negative_prompt: spec.negativePrompt,
      duration: String(spec.durationSeconds),
      cfg_scale: spec.cfgScale ?? 0.5,
    }),
  });

  const text = await response.text();
  let body: unknown;
  try {
    body = text.length > 0 ? JSON.parse(text) : {};
  } catch {
    throw new ServiceError("fal", "non-json-response", `${response.status} ${text.slice(0, 200)}`);
  }
  if (!response.ok) {
    throw new ServiceError(
      "fal",
      `http-${response.status}`,
      typeof body === "object" && body !== null && "detail" in body
        ? String((body as { detail: unknown }).detail)
        : response.statusText,
      body,
    );
  }

  const submission = body as FalSubmitResponse;
  log.info("fal.submitted", { requestId: submission.request_id });
  return {
    jobId: submission.request_id,
    status: "submitted",
    costCents: costForDuration(spec.durationSeconds),
  };
}

/**
 * Poll the FAL job until it reaches a terminal state or we timeout.
 * Caller is responsible for limiting parallel polls (one-per-client-per-month
 * means we never poll more than ~10 jobs in v1).
 */
export async function pollKlingJob(jobId: string): Promise<KlingJobResult> {
  const apiKey = requireFalKey();
  const deadline = Date.now() + MAX_WAIT_MS;

  while (Date.now() < deadline) {
    const statusRes = await fetch(`${FAL_BASE}/${FAL_MODEL}/requests/${jobId}/status`, {
      headers: { "Authorization": `Key ${apiKey}` },
    });
    const statusText = await statusRes.text();
    let statusBody: unknown;
    try {
      statusBody = JSON.parse(statusText);
    } catch {
      throw new ServiceError("fal", "non-json-response", `status ${statusRes.status}`);
    }
    const status = statusBody as FalStatusResponse;

    if (status.status === "COMPLETED") {
      const resultRes = await fetch(`${FAL_BASE}/${FAL_MODEL}/requests/${jobId}`, {
        headers: { "Authorization": `Key ${apiKey}` },
      });
      const result = (await resultRes.json()) as FalResultResponse;
      log.info("fal.completed", { jobId });
      const out: KlingJobResult = {
        jobId,
        status: "completed",
        costCents: 50,
      };
      if (result.video?.url) out.videoUrl = result.video.url;
      return out;
    }
    if (status.status === "FAILED") {
      throw new ServiceError("fal", "job-failed", `FAL job ${jobId} failed`);
    }

    await sleep(POLL_INTERVAL_MS);
  }
  throw new ServiceError("fal", "poll-timeout", `FAL job ${jobId} did not complete within ${MAX_WAIT_MS}ms`);
}
