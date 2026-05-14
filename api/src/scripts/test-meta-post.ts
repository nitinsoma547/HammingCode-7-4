/**
 * Smoke test for the Meta client.
 *
 * Run modes:
 *   npm run test:meta-post           — dry-run, prints the payloads, calls nothing
 *   DRY_RUN=false npm run test:meta-post  — hits Meta for real (requires App Review approved)
 *
 * Use this against a test Page / IG you own before pointing at real client pages.
 */

import { publishFacebookPost, publishInstagramPost } from "@/services/meta";
import { log } from "@/lib/logger";

const dryRun = (process.env.DRY_RUN ?? "true").toLowerCase() !== "false";

async function main(): Promise<void> {
  log.info("test-meta-post.start", { dryRun });

  // FB Page text post
  const fbResult = await publishFacebookPost(
    {
      kind: "text",
      message:
        "Mother's Day brunch this Sunday, May 10. Three vendors, one pre-fixe, two seatings (10:30 and 12:30). Reserve at (703) 480-5100.",
    },
    { dryRun },
  );
  log.info("test-meta-post.fb-result", { fbResult });

  // IG photo post
  const igResult = await publishInstagramPost(
    {
      kind: "photo",
      imageUrl: "https://example.com/test-dish.jpg",
      caption:
        "Mother's Day brunch.\nSunday, May 10.\nThree vendors · one pre-fixe.\nReserve: (703) 480-5100",
    },
    { dryRun },
  );
  log.info("test-meta-post.ig-result", { igResult });

  log.info("test-meta-post.done");
}

main().catch((err: unknown) => {
  log.error("test-meta-post.failed", { error: err instanceof Error ? err.message : String(err) });
  process.exit(1);
});
