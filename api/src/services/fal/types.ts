/**
 * FAL.AI Kling 3.0 image-to-video types.
 *
 * Per CLAUDE.md §9: image-to-video only, 1 Reel per client per month
 * standard tier 5s (~$0.50/clip). The video-producer agent owns the
 * prompt structure; this client only handles the submission +
 * polling.
 */

export interface KlingJobSpec {
  /** Required. Public HTTPS URL to a single source photo. */
  imageUrl: string;
  /** Free-form motion + camera description. Keep terse. */
  prompt: string;
  /** Anti-AI-slop list. Always include the canonical set. */
  negativePrompt: string;
  /** v1 cap: 5 seconds. 10s requires operator override. */
  durationSeconds: 5 | 10;
  /** Kling default. Lower = tighter to source; higher = looser (riskier). */
  cfgScale?: number;
}

export interface KlingJobResult {
  /** Polled until ready. */
  jobId: string;
  status: "submitted" | "processing" | "completed" | "failed";
  /** HTTPS URL to the rendered MP4. Set when status = "completed". */
  videoUrl?: string;
  /** Estimated cost in cents. 5s standard = 50. 10s = 100. */
  costCents: number;
}
