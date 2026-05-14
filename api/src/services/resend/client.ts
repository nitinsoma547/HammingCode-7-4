/**
 * Resend client — monthly email blast per client.
 *
 * Endpoint: POST /emails (https://resend.com/docs/api-reference/emails/send-email)
 * Bearer auth via RESEND_API_KEY.
 *
 * Free tier: 100 emails/day, 3000/month. v1 sends one batch per client
 * per month — comfortably under the cap until we hit 30+ clients.
 */

import { config } from "@/lib/config";
import { ServiceError } from "@/lib/errors";
import { log } from "@/lib/logger";
import type { EmailBlock, EmailPayload, ResendSendResult } from "./types";

const RESEND_BASE = "https://api.resend.com";

function requireResendKey(): string {
  if (!config.resend.apiKey) {
    throw new ServiceError("resend", "missing-key", "RESEND_API_KEY not set. See .env.example.");
  }
  return config.resend.apiKey;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function blockToHtml(block: EmailBlock): string {
  switch (block.type) {
    case "heading":
      return `<h1 style="font-family:Georgia,serif;font-size:28px;color:#1F4E5C;margin:0 0 16px;">${escapeHtml(block.text ?? "")}</h1>`;
    case "heading_secondary":
      return `<h2 style="font-family:Georgia,serif;font-size:20px;color:#1F4E5C;margin:24px 0 12px;">${escapeHtml(block.text ?? "")}</h2>`;
    case "paragraph":
      return `<p style="font-family:Inter,Arial,sans-serif;font-size:15px;line-height:1.6;color:#1F2421;margin:0 0 16px;">${escapeHtml(block.text ?? "")}</p>`;
    case "list": {
      const items = (block.items ?? []).map((i) => `<li style="margin:6px 0;">${escapeHtml(i)}</li>`).join("");
      return `${block.label ? `<p style="margin:0 0 6px;font-weight:600;">${escapeHtml(block.label)}</p>` : ""}<ul style="font-family:Inter,Arial,sans-serif;font-size:15px;line-height:1.6;color:#1F2421;padding-left:20px;margin:0 0 16px;">${items}</ul>`;
    }
    case "cta":
      return `<p style="margin:24px 0;"><a href="${escapeHtml(block.url ?? "#")}" style="display:inline-block;background:#1F4E5C;color:#F5EFE6;font-family:Inter,Arial,sans-serif;font-size:15px;font-weight:500;padding:12px 24px;border-radius:24px;text-decoration:none;">${escapeHtml(block.label ?? "Learn more")}</a></p>`;
    case "footer_note":
      return `<p style="font-family:Inter,Arial,sans-serif;font-size:12px;color:#3A413D;margin:32px 0 0;border-top:1px solid #E3DCD0;padding-top:16px;">${escapeHtml(block.text ?? "")}</p>`;
    default: {
      const _exhaustive: never = block.type;
      throw new ServiceError("resend", "unknown-block-type", `Unknown block type: ${String(_exhaustive)}`);
    }
  }
}

function renderHtml(payload: EmailPayload): string {
  const body = payload.bodyBlocks.map(blockToHtml).join("\n");
  return `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(payload.subject)}</title></head>
<body style="margin:0;padding:24px;background:#F5EFE6;">
  <div style="display:none;font-size:1px;color:#F5EFE6;line-height:1px;opacity:0;">${escapeHtml(payload.preheader)}</div>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:600px;margin:0 auto;background:#F5EFE6;">
    <tr><td style="padding:24px;">${body}</td></tr>
  </table>
</body></html>`;
}

interface ResendApiResponse {
  id: string;
}

export async function sendEmail(
  payload: EmailPayload,
  options: { dryRun?: boolean } = {},
): Promise<ResendSendResult> {
  if (options.dryRun) {
    log.info("resend.dry-run", {
      to: payload.toEmails.length,
      subject: payload.subject,
      scheduled: payload.scheduledFor ?? null,
    });
    return { id: "dry-run", costCents: 0, scheduledFor: payload.scheduledFor ?? null };
  }

  if (payload.subject.length > 60) {
    log.warn("resend.subject-too-long", { length: payload.subject.length });
  }
  if (payload.toEmails.length === 0) {
    throw new ServiceError("resend", "no-recipients", "toEmails must have at least one address.");
  }

  const apiKey = requireResendKey();
  const requestBody: Record<string, unknown> = {
    from: `${payload.fromName} <${payload.fromEmail}>`,
    to: payload.toEmails,
    reply_to: payload.replyTo,
    subject: payload.subject,
    html: renderHtml(payload),
    text: payload.plainTextFallback,
    headers: {
      "X-Entity-Ref-ID": payload.campaignTag ?? "uncategorized",
    },
  };
  if (payload.scheduledFor != null) {
    requestBody["scheduled_at"] = new Date(payload.scheduledFor * 1000).toISOString();
  }

  const response = await fetch(`${RESEND_BASE}/emails`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  const text = await response.text();
  let body: unknown;
  try {
    body = text.length > 0 ? JSON.parse(text) : {};
  } catch {
    throw new ServiceError("resend", "non-json-response", `${response.status} ${text.slice(0, 200)}`);
  }
  if (!response.ok) {
    throw new ServiceError(
      "resend",
      `http-${response.status}`,
      typeof body === "object" && body !== null && "message" in body
        ? String((body as { message: unknown }).message)
        : response.statusText,
      body,
    );
  }
  const apiResult = body as ResendApiResponse;
  log.info("resend.sent", { id: apiResult.id, to: payload.toEmails.length, scheduled: payload.scheduledFor ?? null });
  return { id: apiResult.id, costCents: 0, scheduledFor: payload.scheduledFor ?? null };
}
