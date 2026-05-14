/**
 * Campaign dispatcher.
 *
 * Takes a `clients/<slug>/campaigns/<month>/` directory (JSON files
 * produced by the agent team) and dispatches each asset to the right
 * channel client:
 *   social-calendar.json  -> Meta (preferred) or Outstand (fallback)
 *   gbp-posts.json        -> Outstand
 *   email.json            -> Resend
 *   reel.json             -> FAL.AI Kling 3.0
 *   flyer/*.png           -> attached to social posts that reference it
 *
 * Writes a `dispatch-log.json` next to the campaign manifest, recording
 * what was sent / scheduled, IDs returned, errors per slot.
 *
 * Idempotency: re-running with the same campaign dir does NOT re-dispatch
 * slots whose IDs are already in dispatch-log.json. Operator can force
 * a single slot to retry by deleting its entry.
 *
 * Runs in dry-run mode by default. Set DRY_RUN=false to dispatch for real.
 */

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { publishCrossPost, publishFacebookPost, publishInstagramPost } from "@/services/meta";
import { schedulePost as outstandSchedulePost } from "@/services/outstand";
import type { OutstandChannel } from "@/services/outstand";
import { sendEmail } from "@/services/resend";
import { submitKlingJob } from "@/services/fal";
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
  /** Filled by operator after picking from intake. */
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
  /** Operator must supply at dispatch time — comes from Supabase. */
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
  service: "meta" | "outstand" | "resend" | "fal";
  external_id: string;
  cost_cents: number;
  status: "scheduled" | "posted" | "submitted" | "skipped" | "failed";
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

interface DispatchOptions {
  campaignDir: string;
  dryRun: boolean;
  /** "meta" routes social posts via Graph API direct; "outstand" via Outstand. */
  socialChannel: "meta" | "outstand";
  /** When dispatching Outstand, this Page connection ID is needed per client. */
  outstandConnectionId?: string;
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

async function dispatchSocialCalendar(
  calendar: SocialCalendar,
  options: DispatchOptions,
  alreadyDispatched: Set<string>,
): Promise<DispatchLogEntry[]> {
  const entries: DispatchLogEntry[] = [];
  for (const post of calendar.posts) {
    const key = `${post.slot_id}:social`;
    if (alreadyDispatched.has(key)) {
      entries.push({
        slot_id: post.slot_id,
        channel: post.channels.join("+"),
        dispatched_at: Date.now(),
        service: options.socialChannel,
        external_id: "skipped-idempotent",
        cost_cents: 0,
        status: "skipped",
      });
      continue;
    }

    // Reel slots are handled by the FAL flow + a separate IG post once the
    // video URL is back. Skip here.
    if (post.kind === "reel") {
      entries.push({
        slot_id: post.slot_id,
        channel: "ig-reel",
        dispatched_at: Date.now(),
        service: options.socialChannel,
        external_id: "deferred-to-fal",
        cost_cents: 0,
        status: "skipped",
      });
      continue;
    }

    const mediaUrl = post.media_url;
    if (!mediaUrl && post.needs_image_from_intake) {
      entries.push({
        slot_id: post.slot_id,
        channel: post.channels.join("+"),
        dispatched_at: Date.now(),
        service: options.socialChannel,
        external_id: "no-media-url",
        cost_cents: 0,
        status: "failed",
        error: "Slot has needs_image_from_intake=true but no media_url set. Operator must fill before dispatch.",
      });
      continue;
    }

    const scheduledFor = isoToUnixSeconds(post.scheduled_for);

    try {
      if (options.socialChannel === "meta") {
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
      } else {
        if (!options.outstandConnectionId) {
          throw new Error("Outstand connection ID required when socialChannel=outstand.");
        }
        const channels: OutstandChannel[] = [];
        if (post.channels.includes("fb")) channels.push("facebook");
        if (post.channels.includes("ig")) channels.push("instagram");

        const caption =
          channels.length === 2
            ? post.caption_ig ?? post.caption_fb ?? ""
            : channels[0] === "facebook"
            ? post.caption_fb ?? ""
            : post.caption_ig ?? "";

        const result = await outstandSchedulePost(
          {
            connectionId: options.outstandConnectionId,
            channels,
            scheduledFor,
            caption,
            mediaUrls: mediaUrl ? [mediaUrl] : [],
          },
          { dryRun: options.dryRun },
        );
        entries.push({
          slot_id: post.slot_id,
          channel: channels.join("+"),
          dispatched_at: Date.now(),
          service: "outstand",
          external_id: result.id,
          cost_cents: result.costCents,
          status: "scheduled",
        });
      }
    } catch (err) {
      entries.push({
        slot_id: post.slot_id,
        channel: post.channels.join("+"),
        dispatched_at: Date.now(),
        service: options.socialChannel,
        external_id: "error",
        cost_cents: 0,
        status: "failed",
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }
  return entries;
}

async function dispatchGBPPosts(
  pack: GBPPosts,
  options: DispatchOptions,
  alreadyDispatched: Set<string>,
): Promise<DispatchLogEntry[]> {
  const entries: DispatchLogEntry[] = [];
  if (!options.outstandConnectionId) {
    log.warn("dispatch.gbp.no-outstand", { hint: "Provide outstandConnectionId to dispatch GBP posts." });
    return entries;
  }
  for (const gbp of pack.gbp_posts) {
    const key = `${gbp.slot_id}:gbp`;
    if (alreadyDispatched.has(key)) {
      entries.push({
        slot_id: gbp.slot_id,
        channel: "gbp",
        dispatched_at: Date.now(),
        service: "outstand",
        external_id: "skipped-idempotent",
        cost_cents: 0,
        status: "skipped",
      });
      continue;
    }
    try {
      const gbpCta = gbp.cta_button && gbp.cta_url
        ? {
            button: gbp.cta_button as "ORDER" | "BOOK" | "CALL_NOW" | "LEARN_MORE" | "SIGN_UP",
            url: gbp.cta_url,
          }
        : null;
      const result = await outstandSchedulePost(
        {
          connectionId: options.outstandConnectionId,
          channels: ["google_business_profile"],
          scheduledFor: isoToUnixSeconds(gbp.scheduled_for),
          caption: `${gbp.title}\n\n${gbp.body}`,
          mediaUrls: gbp.media_url ? [gbp.media_url] : [],
          ...(gbpCta ? { gbpCta } : {}),
        },
        { dryRun: options.dryRun },
      );
      entries.push({
        slot_id: gbp.slot_id,
        channel: "gbp",
        dispatched_at: Date.now(),
        service: "outstand",
        external_id: result.id,
        cost_cents: result.costCents,
        status: "scheduled",
      });
    } catch (err) {
      entries.push({
        slot_id: gbp.slot_id,
        channel: "gbp",
        dispatched_at: Date.now(),
        service: "outstand",
        external_id: "error",
        cost_cents: 0,
        status: "failed",
        error: err instanceof Error ? err.message : String(err),
      });
    }
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
      .map((e) => `${e.slot_id}:${e.channel.includes("gbp") ? "gbp" : e.channel.includes("email") ? "email" : e.channel.includes("reel") ? "reel" : "social"}`),
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
    socialChannel: options.socialChannel,
    hasSocial: social !== null,
    hasGbp: gbp !== null,
    hasEmail: email !== null,
    hasReel: reel !== null,
  });

  const entries: DispatchLogEntry[] = [];
  if (social) entries.push(...(await dispatchSocialCalendar(social, options, alreadyDispatched)));
  if (gbp) entries.push(...(await dispatchGBPPosts(gbp, options, alreadyDispatched)));
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
    totalCostCents: dispatchLog.total_cost_cents,
  });
  return dispatchLog;
}
