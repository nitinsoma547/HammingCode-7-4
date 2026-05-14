/**
 * Resend types — monthly email blast.
 *
 * v1 sends a single batch per client per month per CLAUDE.md §9.
 * We do NOT use Resend's broadcast / contact-list features in v1 —
 * keep the architecture simple, send one blast at a time.
 */

export interface EmailBlock {
  type: "heading" | "heading_secondary" | "paragraph" | "list" | "cta" | "footer_note";
  text?: string;
  label?: string | null;
  url?: string;
  items?: string[];
}

export interface EmailPayload {
  fromName: string;
  /** Must be a verified Resend domain. */
  fromEmail: string;
  replyTo: string;
  toEmails: string[];
  subject: string;
  preheader: string;
  bodyBlocks: EmailBlock[];
  plainTextFallback: string;
  /** UNIX seconds. If set, Resend defers the send. */
  scheduledFor?: number;
  /** For per-client cost / audit tracking. */
  campaignTag?: string;
}

export interface ResendSendResult {
  id: string;
  /** Resend doesn't return cost; free tier covers our v1 volume. */
  costCents: 0;
  scheduledFor: number | null;
}
