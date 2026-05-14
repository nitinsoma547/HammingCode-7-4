/**
 * Run the dispatcher against the ChefScape May 2026 campaign pack.
 *
 *   npm run dispatch:chefscape                  # dry-run, prints what would post
 *   DRY_RUN=false npm run dispatch:chefscape    # real dispatch (needs Meta/Outstand/Resend/FAL creds)
 *
 * Defaults to Outstand for social since Meta App Review is the gating
 * factor in the next 4-6 weeks. Switch SOCIAL_CHANNEL=meta once approved.
 */

import path from "node:path";
import { fileURLToPath } from "node:url";

import { dispatchCampaign } from "@/jobs/dispatch-campaign";
import { log } from "@/lib/logger";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));

async function main(): Promise<void> {
  const dryRun = (process.env.DRY_RUN ?? "true").toLowerCase() !== "false";
  const socialChannel = (process.env.SOCIAL_CHANNEL ?? "outstand") as "meta" | "outstand";

  const campaignDir = path.resolve(
    scriptDir,
    "../../../clients/chefscape/campaigns/2026-05",
  );

  const result = await dispatchCampaign({
    campaignDir,
    dryRun,
    socialChannel,
    outstandConnectionId: process.env.OUTSTAND_CONNECTION_ID_CHEFSCAPE ?? "chefscape-conn-placeholder",
  });

  log.info("dispatch-chefscape-may.summary", {
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
  log.error("dispatch-chefscape-may.failed", { error: err instanceof Error ? err.message : String(err) });
  process.exit(1);
});
