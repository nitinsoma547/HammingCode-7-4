/**
 * Outstand client — fallback for FB/IG/GBP posting while Meta App Review
 * is pending. Per-post billing at $0.01 per channel.
 *
 * No official SDK. REST endpoints, bearer-token auth via
 * OUTSTAND_API_KEY. Docs at https://www.outstand.so/docs (subject to
 * change — pin against the version your account is using).
 */

import { config } from "@/lib/config";
import { ServiceError } from "@/lib/errors";
import { log } from "@/lib/logger";
import type { OutstandPostResult, OutstandSchedulePayload } from "./types";

const OUTSTAND_BASE = "https://api.outstand.so/v1";

interface OutstandApiResponse {
  id: string;
  status: "scheduled" | "posted" | "failed";
  scheduled_for: number | null;
  channels: string[];
}

function requireOutstandKey(): string {
  if (!config.outstand.apiKey) {
    throw new ServiceError("outstand", "missing-key", "OUTSTAND_API_KEY not set. See .env.example.");
  }
  return config.outstand.apiKey;
}

export async function schedulePost(
  payload: OutstandSchedulePayload,
  options: { dryRun?: boolean } = {},
): Promise<OutstandPostResult> {
  if (options.dryRun) {
    log.info("outstand.dry-run", { payload });
    return {
      id: "dry-run",
      status: "scheduled",
      scheduledFor: payload.scheduledFor,
      costCents: payload.channels.length,
    };
  }

  if (payload.channels.includes("instagram") && payload.mediaUrls.length === 0) {
    throw new ServiceError("outstand", "ig-needs-media", "Instagram posts require at least one mediaUrls entry.");
  }

  const apiKey = requireOutstandKey();
  const response = await fetch(`${OUTSTAND_BASE}/posts`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      connection_id: payload.connectionId,
      channels: payload.channels,
      scheduled_for: payload.scheduledFor,
      caption: payload.caption,
      media_urls: payload.mediaUrls,
      gbp_cta: payload.gbpCta,
    }),
  });

  const text = await response.text();
  let body: unknown;
  try {
    body = text.length > 0 ? JSON.parse(text) : {};
  } catch {
    throw new ServiceError("outstand", "non-json-response", `${response.status} ${text.slice(0, 200)}`);
  }
  if (!response.ok) {
    throw new ServiceError(
      "outstand",
      `http-${response.status}`,
      typeof body === "object" && body !== null && "message" in body
        ? String((body as { message: unknown }).message)
        : response.statusText,
      body,
    );
  }
  const apiResult = body as OutstandApiResponse;
  log.info("outstand.scheduled", { id: apiResult.id, channels: apiResult.channels });
  return {
    id: apiResult.id,
    status: apiResult.status,
    scheduledFor: apiResult.scheduled_for,
    costCents: payload.channels.length,
  };
}
