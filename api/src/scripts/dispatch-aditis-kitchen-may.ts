/**
 * Run the dispatcher against the Aditi's Kitchen May 2026 campaign pack.
 *
 *   npm run dispatch:aditis-kitchen                  # dry-run, prints what would post
 *   DRY_RUN=false npm run dispatch:aditis-kitchen    # real dispatch (needs Meta/Resend/FAL creds)
 *
 * Social dispatches via Meta Graph API only. Until Meta App Review approves
 * (and META_PAGE_ACCESS_TOKEN etc. are set in .env), social posts log as
 * status="manual_required" — the operator copy-pastes from caption_fb /
 * caption_ig until the API is live. Email + Reel dispatch immediately
 * since Resend + FAL don't depend on App Review.
 *
 * Aditi's Kitchen is the default-target-audience client (South Indian
 * vegetarian, Ashburn, WhatsApp-broadcast on). See clients/aditis/kitchen/
 * campaigns/2026-05/README.md for the campaign overview.
 */

import path from "node:path";
import { fileURLToPath } from "node:url";

import { dispatchCampaign } from "@/jobs/dispatch-campaign";
import { log } from "@/lib/logger";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));

async function main(): Promise<void> {
  const dryRun = (process.env.DRY_RUN ?? "true").toLowerCase() !== "false";

  const campaignDir = path.resolve(
    scriptDir,
    "../../../clients/aditis/kitchen/campaigns/2026-05",
  );

  const result = await dispatchCampaign({
    campaignDir,
    dryRun,
  });

  log.info("dispatch-aditis-kitchen-may.summary", {
    clientId: result.client_id,
    month: result.month,
    entries: result.entries.length,
    scheduled: result.entries.filter((e) => e.status === "scheduled" || e.status === "posted" || e.status === "submitted").length,
    failed: result.entries.filter((e) => e.status === "failed").length,
    skipped: result.entries.filter((e) => e.status === "skipped").length,
    totalCostCents: result.total_cost_cents,
  });
}

main().catch((err: unknown) => {
  log.error("dispatch-aditis-kitchen-may.failed", { error: err instanceof Error ? err.message : String(err) });
  process.exit(1);
});
