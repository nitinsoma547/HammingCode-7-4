/**
 * Outstand types. Outstand has no official TS SDK — we wrote our own
 * thin client. Endpoints: REST, JSON, bearer-token auth.
 */

export type OutstandChannel = "facebook" | "instagram" | "google_business_profile";

export interface OutstandSchedulePayload {
  /** Outstand connection ID for the client's Page (set up once in Outstand UI). */
  connectionId: string;
  channels: OutstandChannel[];
  /** UNIX seconds. Set null for "post now". */
  scheduledFor: number | null;
  caption: string;
  /** URL(s) to media. Empty = text-only (FB only — IG requires media). */
  mediaUrls: string[];
  /** For GBP only: button type. */
  gbpCta?: {
    button: "ORDER" | "BOOK" | "CALL_NOW" | "LEARN_MORE" | "SIGN_UP";
    url: string;
  };
}

export interface OutstandPostResult {
  /** Outstand's internal post id. Store on campaign_assets.outstand_id. */
  id: string;
  status: "scheduled" | "posted" | "failed";
  scheduledFor: number | null;
  /** Estimated cost in cents — $0.01 per channel per post. */
  costCents: number;
}
