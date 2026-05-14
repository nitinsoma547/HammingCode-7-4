/**
 * Campaign dispatcher — Meta-only for social, Resend for email, FAL for Reels.
 *
 * Takes a `clients/<slug>/campaigns/<month>/` directory (JSON files
 * produced by the agent team) and dispatches each asset to its channel:
 *   social-calendar.json  -> Meta Graph API (FB Pages + IG Business)
 *   gbp-posts.json        -> operator-manual until the GBP API client lands
 *   email.json            -> Resend
 *   reel.json             -> FAL.AI Kling 3.0
 *
 * During the Meta App Review window (4-6 weeks), social dispatch fails
 * with a clear "App Review pending" message. Email + Reel automation
 * still works because Resend + FAL don't require App Review.
 *
 * Writes `dispatch-log.json` next to the campaign manifest. Idempotent
 * on re-runs (skips slots already scheduled).
 *
 * Dry-run by default. Set DRY_RUN=false to dispatch for real.
 */

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { publishCrossPost, publishFacebookPost, publishInstagramPost } from "@/services/meta";
import { sendEmail } from "@/services/resend";
import { submitKlingJob } from "@/services/fal";
import { config } from "@/lib/config";
import { log } from "@/lib/logger";

interface SocialPost {
  slot_id: string;
  scheduled_for: string;
  channels: Array<"fb" | "ig">;
  kind: string;
  caption_fb?: string;
  caption_ig?: string;
  image_brief?: string;
  needs_image_from_intake?: boolean;
  media_url?: string;
}

interface SocialCalendar {
  client_id: string;
  month: string;
  posts: SocialPost[];
}

interface GBPPost {
  slot_id: string;
  kind: "update" | "offer" | "event" | "product";
  title: string;
  body: string;
  cta_button?: string;
  cta_url?: string;
  scheduled_for: string;
  expires_at?: string;
  media_url?: string;
}

interface GBPPosts {
  client_id: string;
  month: string;
  gbp_posts: GBPPost[];
}

interface EmailPayloadFile {
  client_id: string;
  month: string;
  send_at: string;
  from_name: string;
  from_email: string;
  reply_to: string;
  subject: string;
  preheader: string;
  body_blocks: Array<{ type: string; text?: string; label?: string | null; url?: string; items?: string[] }>;
  plain_text_fallback: string;
  to_emails?: string[];
}

interface ReelSpec {
  client_id: string;
  month: string;
  photo_selection: { selected_photo_url: string };
  fal_job_spec: {
    image_url: string;
    prompt: string;
    duration_seconds: 5 | 10;
    cfg_scale?: number;
    negative_prompt: string;
  };
}

interface DispatchLogEntry {
  slot_id: string;
  channel: string;
  dispatched_at: number;
  service: "meta" | "resend" | "fal" | "operator-manual";
  external_id: string;
  cost_cents: number;
  status: "scheduled" | "posted" | "submitted" | "skipped" | "failed" | "manual_required";
  error?: string;
}

interface DispatchLog {
  client_id: string;
  month: string;
  started_at: number;
  finished_at?: number;
  dry_run: boolean;
  total_cost_cents: number;
  entries: DispatchLogEntry[];
}

export interface DispatchOptions {
  campaignDir: string;
  dryRun: boolean;
}

async function readJsonOrNull<T>(p: string): Promise<T | null> {
  try {
    const text = await readFile(p, "utf-8");
    return JSON.parse(text) as T;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw err;
  }
}

function isoToUnixSeconds(iso: string): number {
  return Math.floor(new Date(iso).getTime() / 1000);
}

function metaCredsConfigured(): boolean {
  return Boolean(config.meta.pageAccessToken && config.meta.fbPageId && config.meta.igUserId);
}

async function dispatchSocialCalendar(
  calendar: SocialCalendar,
  options: DispatchOptions,
  alreadyDispatched: Set<string>,
): Promise<DispatchLogEntry[]> {
  const entries: DispatchLogEntry[] = [];
  const credsReady = metaCredsConfigured();

  for (const post of calendar.posts) {
    const key = `${post.slot_id}:social`;
    if (alreadyDispatched.has(key)) {
      entries.push({
        slot_id: post.slot_id,
        channel: post.channels.join("+"),
        dispatched_at: Date.now(),
        service: "meta",
        external_id: "skipped-idempotent",
        cost_cents: 0,
        status: "skipped",
      });
      continue;
    }

    if (post.kind === "reel") {
      entries.push({
        slot_id: post.slot_id,
        channel: "ig-reel",
        dispatched_at: Date.now(),
        service: "fal",
        external_id: "deferred-to-fal",
        cost_cents: 0,
        status: "skipped",
      });
      continue;
    }

    if (!options.dryRun && !credsReady) {
      entries.push({
        slot_id: post.slot_id,
        channel: post.channels.join("+"),
        dispatched_at: Date.now(),
        service: "meta",
        external_id: "app-review-pending",
        cost_cents: 0,
        status: "manual_required",
        error: "Meta credentials not set. Either App Review is still pending or .env not configured. Operator must post manually from caption_fb / caption_ig + media_url until Meta is live.",
      });
      continue;
    }

    const mediaUrl = post.media_url;
    if (!mediaUrl && post.needs_image_from_intake) {
      entries.push({
        slot_id: post.slot_id,
        channel: post.channels.join("+"),
        dispatched_at: Date.now(),
        service: "meta",
        external_id: "no-media-url",
        cost_cents: 0,
        status: "failed",
        error: "Slot has needs_image_from_intake=true but no media_url set. Operator must fill before dispatch.",
      });
      continue;
    }

    const scheduledFor = isoToUnixSeconds(post.scheduled_for);

    try {
      if (post.channels.includes("fb") && post.channels.includes("ig") && mediaUrl) {
        const result = await publishCrossPost({
          kind: "photo",
          imageUrl: mediaUrl,
          fbCaption: post.caption_fb ?? "",
          igCaption: post.caption_ig ?? "",
          fbScheduledPublishTime: scheduledFor,
        });
        entries.push({
          slot_id: post.slot_id,
          channel: "fb",
          dispatched_at: Date.now(),
          service: "meta",
          external_id: result.fb.id,
          cost_cents: 0,
          status: "scheduled",
        });
        entries.push({
          slot_id: post.slot_id,
          channel: "ig",
          dispatched_at: Date.now(),
          service: "meta",
          external_id: result.ig.id,
          cost_cents: 0,
          status: "posted",
        });
      } else if (post.channels.includes("fb") && post.caption_fb) {
        const fbPost = mediaUrl
          ? { kind: "photo" as const, imageUrl: mediaUrl, message: post.caption_fb, scheduledPublishTime: scheduledFor }
          : { kind: "text" as const, message: post.caption_fb, scheduledPublishTime: scheduledFor };
        const result = await publishFacebookPost(fbPost, { dryRun: options.dryRun });
        entries.push({
          slot_id: post.slot_id,
          channel: "fb",
          dispatched_at: Date.now(),
          service: "meta",
          external_id: result.id,
          cost_cents: 0,
          status: "scheduled",
        });
      } else if (post.channels.includes("ig") && post.caption_ig && mediaUrl) {
        const result = await publishInstagramPost(
          { kind: "photo", imageUrl: mediaUrl, caption: post.caption_ig },
          { dryRun: options.dryRun },
        );
        entries.push({
          slot_id: post.slot_id,
          channel: "ig",
          dispatched_at: Date.now(),
          service: "meta",
          external_id: result.id,
          cost_cents: 0,
          status: "posted",
        });
      }
    } catch (err) {
      entries.push({
        slot_id: post.slot_id,
        channel: post.channels.join("+"),
        dispatched_at: Date.now(),
        service: "meta",
        external_id: "error",
        cost_cents: 0,
        status: "failed",
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }
  return entries;
}

/**
 * GBP posts are operator-manual in v1.
 *
 * Why: the Google Business Profile API (`google-my-business`) requires a
 * separate OAuth flow + its own quota / verification — different from Meta
 * App Review. v1 path: agent generates the GBP post copy + image_brief,
 * dispatcher records each post in dispatch-log.json with status
 * "manual_required", and the operator copy-pastes into business.google.com
 * (or schedules in the GBP web UI).
 *
 * Build a native GBP API client when we hit ~10 clients and the manual
 * paste becomes the bottleneck.
 */
function dispatchGBPPostsManual(
  pack: GBPPosts,
  alreadyDispatched: Set<string>,
): DispatchLogEntry[] {
  const entries: DispatchLogEntry[] = [];
  for (const gbp of pack.gbp_posts) {
    const key = `${gbp.slot_id}:gbp`;
    if (alreadyDispatched.has(key)) {
      entries.push({
        slot_id: gbp.slot_id,
        channel: "gbp",
        dispatched_at: Date.now(),
        service: "operator-manual",
        external_id: "skipped-idempotent",
        cost_cents: 0,
        status: "skipped",
      });
      continue;
    }
    entries.push({
      slot_id: gbp.slot_id,
      channel: "gbp",
      dispatched_at: Date.now(),
      service: "operator-manual",
      external_id: "operator-paste",
      cost_cents: 0,
      status: "manual_required",
      error: "GBP API client not built in v1. Operator pastes title + body into business.google.com — copy is ready in gbp-posts.json.",
    });
  }
  return entries;
}

async function dispatchEmail(
  email: EmailPayloadFile,
  options: DispatchOptions,
  alreadyDispatched: Set<string>,
): Promise<DispatchLogEntry[]> {
  const slotId = `email:${email.month}`;
  if (alreadyDispatched.has(slotId)) {
    return [
      {
        slot_id: slotId,
        channel: "email",
        dispatched_at: Date.now(),
        service: "resend",
        external_id: "skipped-idempotent",
        cost_cents: 0,
        status: "skipped",
      },
    ];
  }

  const toEmails = email.to_emails ?? [];
  if (toEmails.length === 0) {
    return [
      {
        slot_id: slotId,
        channel: "email",
        dispatched_at: Date.now(),
        service: "resend",
        external_id: "no-recipients",
        cost_cents: 0,
        status: "failed",
        error: "email.json has no to_emails. Operator must inject the client's audience list before dispatch.",
      },
    ];
  }

  try {
    const bodyBlocks = email.body_blocks.map((b) => {
      const block: {
        type: "heading" | "heading_secondary" | "paragraph" | "list" | "cta" | "footer_note";
        text?: string;
        label?: string | null;
        url?: string;
        items?: string[];
      } = { type: b.type as "heading" | "heading_secondary" | "paragraph" | "list" | "cta" | "footer_note" };
      if (b.text !== undefined) block.text = b.text;
      if (b.label !== undefined) block.label = b.label;
      if (b.url !== undefined) block.url = b.url;
      if (b.items !== undefined) block.items = b.items;
      return block;
    });
    const result = await sendEmail(
      {
        fromName: email.from_name,
        fromEmail: email.from_email,
        replyTo: email.reply_to,
        toEmails,
        subject: email.subject,
        preheader: email.preheader,
        bodyBlocks,
        plainTextFallback: email.plain_text_fallback,
        scheduledFor: isoToUnixSeconds(email.send_at),
        campaignTag: `${email.client_id}-${email.month}`,
      },
      { dryRun: options.dryRun },
    );
    return [
      {
        slot_id: slotId,
        channel: "email",
        dispatched_at: Date.now(),
        service: "resend",
        external_id: result.id,
        cost_cents: result.costCents,
        status: "scheduled",
      },
    ];
  } catch (err) {
    return [
      {
        slot_id: slotId,
        channel: "email",
        dispatched_at: Date.now(),
        service: "resend",
        external_id: "error",
        cost_cents: 0,
        status: "failed",
        error: err instanceof Error ? err.message : String(err),
      },
    ];
  }
}

async function dispatchReel(
  reel: ReelSpec,
  options: DispatchOptions,
  alreadyDispatched: Set<string>,
): Promise<DispatchLogEntry[]> {
  const slotId = `reel:${reel.month}`;
  if (alreadyDispatched.has(slotId)) {
    return [
      {
        slot_id: slotId,
        channel: "reel",
        dispatched_at: Date.now(),
        service: "fal",
        external_id: "skipped-idempotent",
        cost_cents: 0,
        status: "skipped",
      },
    ];
  }
  if (reel.photo_selection.selected_photo_url.startsWith("TODO")) {
    return [
      {
        slot_id: slotId,
        channel: "reel",
        dispatched_at: Date.now(),
        service: "fal",
        external_id: "no-photo",
        cost_cents: 0,
        status: "failed",
        error: "Reel photo not selected. Operator must pick from monthly_intake before dispatch.",
      },
    ];
  }

  try {
    const result = await submitKlingJob(
      {
        imageUrl: reel.fal_job_spec.image_url,
        prompt: reel.fal_job_spec.prompt,
        negativePrompt: reel.fal_job_spec.negative_prompt,
        durationSeconds: reel.fal_job_spec.duration_seconds,
        cfgScale: reel.fal_job_spec.cfg_scale ?? 0.5,
      },
      { dryRun: options.dryRun },
    );
    return [
      {
        slot_id: slotId,
        channel: "reel",
        dispatched_at: Date.now(),
        service: "fal",
        external_id: result.jobId,
        cost_cents: result.costCents,
        status: "submitted",
      },
    ];
  } catch (err) {
    return [
      {
        slot_id: slotId,
        channel: "reel",
        dispatched_at: Date.now(),
        service: "fal",
        external_id: "error",
        cost_cents: 0,
        status: "failed",
        error: err instanceof Error ? err.message : String(err),
      },
    ];
  }
}

export async function dispatchCampaign(options: DispatchOptions): Promise<DispatchLog> {
  const dir = path.resolve(options.campaignDir);
  const logPath = path.join(dir, "dispatch-log.json");

  const existingLog = await readJsonOrNull<DispatchLog>(logPath);
  const alreadyDispatched = new Set(
    (existingLog?.entries ?? [])
      .filter((e) => e.status === "scheduled" || e.status === "posted" || e.status === "submitted")
      .map((e) => {
        const c = e.channel;
        const stem = c.includes("gbp")
          ? "gbp"
          : c.includes("email")
          ? "email"
          : c.includes("reel")
          ? "reel"
          : "social";
        return `${e.slot_id}:${stem}`;
      }),
  );

  const social = await readJsonOrNull<SocialCalendar>(path.join(dir, "social-calendar.json"));
  const gbp = await readJsonOrNull<GBPPosts>(path.join(dir, "gbp-posts.json"));
  const email = await readJsonOrNull<EmailPayloadFile>(path.join(dir, "email.json"));
  const reel = await readJsonOrNull<ReelSpec>(path.join(dir, "reel.json"));

  const clientId = social?.client_id ?? gbp?.client_id ?? email?.client_id ?? reel?.client_id ?? "unknown-client";
  const month = social?.month ?? gbp?.month ?? email?.month ?? reel?.month ?? "unknown-month";

  log.info("dispatch.start", {
    clientId,
    month,
    dryRun: options.dryRun,
    metaCredsConfigured: metaCredsConfigured(),
    hasSocial: social !== null,
    hasGbp: gbp !== null,
    hasEmail: email !== null,
    hasReel: reel !== null,
  });

  const entries: DispatchLogEntry[] = [];
  if (social) entries.push(...(await dispatchSocialCalendar(social, options, alreadyDispatched)));
  if (gbp) entries.push(...dispatchGBPPostsManual(gbp, alreadyDispatched));
  if (email) entries.push(...(await dispatchEmail(email, options, alreadyDispatched)));
  if (reel) entries.push(...(await dispatchReel(reel, options, alreadyDispatched)));

  const dispatchLog: DispatchLog = {
    client_id: clientId,
    month,
    started_at: existingLog?.started_at ?? Date.now(),
    finished_at: Date.now(),
    dry_run: options.dryRun,
    total_cost_cents: entries.reduce((sum, e) => sum + e.cost_cents, 0),
    entries: [...(existingLog?.entries ?? []), ...entries],
  };

  await writeFile(logPath, JSON.stringify(dispatchLog, null, 2) + "\n", "utf-8");

  log.info("dispatch.done", {
    clientId,
    month,
    entries: entries.length,
    scheduled: entries.filter((e) => e.status === "scheduled" || e.status === "posted" || e.status === "submitted").length,
    failed: entries.filter((e) => e.status === "failed").length,
    manualRequired: entries.filter((e) => e.status === "manual_required").length,
    totalCostCents: dispatchLog.total_cost_cents,
  });
  return dispatchLog;
}
