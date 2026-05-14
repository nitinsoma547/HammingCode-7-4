# REVIEW — Are we actually replacing a marketing team?

Honest audit as of 2026-05-14. Frame: a real marketing team for a Loudoun
SMB does ~14 distinct functions per month. For each one, do we have
(a) the **brain** that decides + writes content, and (b) the **hands**
that actually post / send / publish it?

---

## Scorecard

| # | Function                                  | Brain (generation)                       | Hands (execution)                                | Status |
|---|-------------------------------------------|------------------------------------------|--------------------------------------------------|--------|
| 1 | Brand strategy + voice rules              | ✅ `brand-strategist` agent              | n/a — applied at onboarding                       | ✅      |
| 2 | Monthly cultural / seasonal hook          | ✅ `cultural-calendar` agent             | n/a — informs other agents                        | ✅      |
| 3 | 30-day FB/IG social calendar              | ✅ `social-media-planner` agent          | 🟡 Meta client ready, App Review pending; Outstand fallback **building this turn** | 🟡 |
| 4 | GBP post pack (4/mo)                      | ✅ `gbp-and-local-seo` agent             | ❌ no Google Business Profile API client          | ❌      |
| 5 | Monthly email blast                       | ✅ `email-marketer` agent                | ❌ Resend client **building this turn**           | 🟡      |
| 6 | Reel (image-to-video)                     | ✅ `video-producer` agent                | ❌ FAL.AI client **building this turn**           | 🟡      |
| 7 | Flyer / IG graphics (PNG)                 | ✅ `visual-designer` agent               | ✅ Playwright `render.sh` works                   | ✅      |
| 8 | Website (build + maintain)                | ✅ `website-developer` agent             | ✅ Aditi Kitchen + Spice Depot live + build clean | ✅      |
| 9 | Local SEO + NAP + schema audit            | ✅ `gbp-and-local-seo` + `local-seo-audit` skill | n/a — produces report; operator action       | ✅      |
| 10 | Review responses (drafts)                | ✅ `reputation-manager` agent            | by-design semi-manual (operator posts)            | ✅      |
| 11 | WhatsApp broadcast                       | ✅ `whatsapp-broadcast-copy` skill       | by-design semi-manual (owner pastes)              | ✅      |
| 12 | Brand voice QA on every asset            | ✅ `brand-voice-reviewer` agent          | n/a — gate, runs before dispatch                  | ✅      |
| 13 | Lead acquisition + outreach              | ✅ `lead-gen-specialist` agent           | 🟡 Python scrapers exist outside repo, not ported | 🟡 |
| 14 | Monthly client report (results)          | ❌ no agent yet                          | ❌ no analytics client yet                        | ❌      |
| 15 | Billing (Stripe subscription + setup)    | n/a                                      | ❌ Stripe client not built                        | ❌      |
| 16 | Campaign dispatcher (the glue)           | n/a — programmatic                       | ❌ **building this turn**                         | 🟡     |
| 17 | Monthly cron (the orchestrator)          | n/a — programmatic                       | ❌ not yet (depends on dispatcher + Supabase)     | ❌      |
| 18 | Supabase data layer (clients, campaigns) | ❌ no schema yet                         | ❌ no migrations yet                              | ❌      |

**Tally:** 8 ✅ done · 5 🟡 in progress this turn · 5 ❌ open

---

## What we've actually shipped (commits on this branch)

1. **`adc328a`** — 12 marketing-team subagents + 9 reusable skills + CLAUDE.md
2. **`8d32fbd`** — `design/` shared system + Aditi's Kitchen Next.js site
3. **`ab56ea1`** — Aditi's Spice Depot Next.js site
4. **`58e3956`** — ChefScape Leesburg May 2026 full campaign pack (proof the team generalizes)
5. **`ca473b9`** — `api/` backend scaffold + Meta Graph API client + `.mcp.json`

Hard numbers:
- Two production-ready client websites that build clean, ~106 kB First Load JS each
- One complete monthly campaign pack with 12 social posts + 4 GBP posts + 1 email + 1 Reel spec + 1 rendered PNG flyer
- Typechecked TypeScript Meta API client that handles FB Pages text/photo/video and IG photo/Reel/carousel
- Cost target hit: ~98¢/client/month vs. the <$1 budget

## What we don't have yet — and why each matters

### Critical (blocks Saturday demo of *automated* posting)

- **Outstand client** — Meta App Review takes 4-6 weeks. Without Outstand
  as a fallback, "automated FB/IG posting" is a future-state promise
  on Saturday. Outstand bridges the gap. *Building this turn.*
- **Resend client** — without this the monthly email never sends, even
  though `email-marketer` wrote it. *Building this turn.*
- **Campaign dispatcher** (`api/src/jobs/dispatch-campaign.ts`) — the
  code that reads `clients/<slug>/campaigns/<month>/*.json` and
  actually calls the channel clients. This is THE proof of end-to-end
  automation. *Building this turn.*

### High value (next sprint, post-Saturday)

- **FAL.AI Kling client** — without this Reels are specs not videos.
  Building this turn if budget permits.
- **GBP API client** — currently the 4 monthly GBP posts are JSON only;
  Outstand can cover this in the short term, but native GBP API gives
  us more control over `cta_button` + product/menu/Q&A management.
- **Stripe** — required to actually charge $497/mo. Not blocking
  demos, blocking the first paying client.
- **Monthly client report** — proves the agency delivered. After 30
  days of posts, we generate a 1-pager: posts sent, reach, top
  performers, what's next month. New agent needed (`analytics-reporter`).

### Foundation (must happen before scale)

- **Supabase schema + migrations** — currently each client lives as
  JSON in `clients/<slug>/`. Fine for 3 clients; doesn't scale to 30.
  Tables per CLAUDE.md §6 (clients, brand_profiles, monthly_intakes,
  campaigns, campaign_assets, leads).
- **Monthly cron** — Railway scheduled job that on the 1st of each
  month: pulls intakes, runs the campaign-generator, dispatches.
  Trivial once dispatcher + Supabase land.
- **Per-client token storage** — currently env vars. Meta tokens are
  per-client; needs the Supabase `clients` table to scale past 1.

---

## What the goal really requires

The user's framing: "we are essentially replacing the whole marketing
team for small businesses in all aspects."

A real marketing team for one SMB costs $2-5k/mo. We charge $497/mo +
$149 onboarding. That math only works because:

1. **One operator runs the whole stack** — no FTEs.
2. **The agents do the strategy + writing** that an account manager + 
   copywriter would do (~$60/hr × 12 hr/mo per client = $720). **Done.**
3. **The clients do the publishing** programmatically — no media buyer
   or social manager scheduling posts manually. **This is what we're 
   building now.**
4. **The operator only does the irreducible humans-required parts**:
   approving copy, handling client conversations, walking into shops
   for new leads, posting review responses (we draft, they post).

The risk we *don't* address yet: the operator becomes a bottleneck at
~10 clients. After that we need:
- Per-client Slack/WhatsApp channels with the owner
- Self-serve approval queue
- More aggressive defaults so most posts auto-approve

That's a v2 problem. v1: prove the team works on Aditi's + ChefScape
+ 3-5 more, then automate the approval loop.

---

## Decision points to flag

1. **Meta App Review now or later?** Code is ready. Submitting starts
   the 4-6 week clock. The longer we wait, the longer Outstand bills
   us per-post. Recommend: submit this week, work on Outstand while
   it's in review.
2. **Outstand vs build our own GBP API path?** GBP isn't in the Meta
   review scope; it's a separate Google API with its own auth. For v1,
   route GBP through Outstand (already in their coverage). Build our
   own GBP client only at 50+ clients.
3. **Do we need a `clients/` JSON layer at all once Supabase lands?**
   Yes — keep it as git-versioned demo material. Production reads
   from DB; demos and tests read from `clients/`.
4. **Onboarding form: still Google Form, or do we build a real
   in-product onboarding flow?** Google Form for v1. Build real
   flow at 25+ clients.

---

## Bottom line

We have the **brains** of a marketing team fully built — 12 agents +
9 skills + a shared design system + two delivered websites + one full
monthly campaign pack proving the system generalizes outside our
default target market.

We're **half done on the hands** — Meta is wired (gated on App Review),
Outstand + Resend + FAL.AI are this turn's work, GBP + analytics +
Stripe + Supabase are the next-sprint work.

After this turn, the answer to "can we automate a monthly campaign
end-to-end?" becomes **yes, via Outstand today and via Meta direct in
4-6 weeks** — for FB, IG, GBP, and email. Reels need FAL.AI which is
this turn or next.
