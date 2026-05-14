# REVIEW — Are we actually replacing a marketing team?

Honest audit as of 2026-05-14. Frame: a real marketing team for a Loudoun
SMB does ~14 distinct functions per month. For each one, do we have
(a) the **brain** that decides + writes content, and (b) the **hands**
that actually post / send / publish it?

**Operator decision (2026-05-14):** No third-party social schedulers
(Outstand, Buffer, Hootsuite). Meta Graph API direct only. The cost is a
4-6 week Meta App Review window during which social posts are
operator-manual from the JSON output. Reason: middleman fees + ToS
restrictions don't compound well at scale. The waiting period is
one-time; the agency stays clean.

---

## Scorecard

| # | Function                                  | Brain (generation)                       | Hands (execution)                                | Status |
|---|-------------------------------------------|------------------------------------------|--------------------------------------------------|--------|
| 1 | Brand strategy + voice rules              | ✅ `brand-strategist` agent              | n/a — applied at onboarding                       | ✅      |
| 2 | Monthly cultural / seasonal hook          | ✅ `cultural-calendar` agent             | n/a — informs other agents                        | ✅      |
| 3 | 30-day FB/IG social calendar              | ✅ `social-media-planner` agent          | 🟡 Meta client ready; operator-manual until App Review approves | 🟡 |
| 4 | GBP post pack (4/mo)                      | ✅ `gbp-and-local-seo` agent             | 🟡 operator pastes into business.google.com until GBP API client lands | 🟡 |
| 5 | Monthly email blast                       | ✅ `email-marketer` agent                | ✅ Resend client live — sends today, no review gate | ✅      |
| 6 | Reel (image-to-video)                     | ✅ `video-producer` agent                | ✅ FAL.AI Kling client live — generates today    | ✅      |
| 7 | Flyer / IG graphics (PNG)                 | ✅ `visual-designer` agent               | ✅ Playwright `render.sh` works                   | ✅      |
| 8 | Website (build + maintain)                | ✅ `website-developer` agent             | ✅ Aditi Kitchen + Spice Depot live + build clean | ✅      |
| 9 | Local SEO + NAP + schema audit            | ✅ `gbp-and-local-seo` + `local-seo-audit` skill | n/a — produces report; operator action       | ✅      |
| 10 | Review responses (drafts)                | ✅ `reputation-manager` agent            | by-design semi-manual (operator posts)            | ✅      |
| 11 | WhatsApp broadcast                       | ✅ `whatsapp-broadcast-copy` skill       | by-design semi-manual (owner pastes)              | ✅      |
| 12 | Brand voice QA on every asset            | ✅ `brand-voice-reviewer` agent          | n/a — gate, runs before dispatch                  | ✅      |
| 13 | Lead acquisition + outreach              | ✅ `lead-gen-specialist` agent           | 🟡 Python scrapers exist outside repo, not ported | 🟡 |
| 14 | Monthly client report (results)          | ❌ no agent yet                          | ❌ no analytics client yet                        | ❌      |
| 15 | Billing (Stripe subscription + setup)    | n/a                                      | ❌ Stripe client not built                        | ❌      |
| 16 | Campaign dispatcher (the glue)           | n/a — programmatic                       | ✅ built, dry-run verified                        | ✅      |
| 17 | Monthly cron (the orchestrator)          | n/a — programmatic                       | ❌ not yet (depends on dispatcher + Supabase)     | ❌      |
| 18 | Supabase data layer (clients, campaigns) | ❌ no schema yet                         | ❌ no migrations yet                              | ❌      |

**Tally:** 11 ✅ done · 3 🟡 gated (Meta App Review, GBP API, scraper port) · 4 ❌ open

---

## What "automated today" actually means

The dispatcher (`npm run dispatch:chefscape`) reads every JSON file in
`clients/<slug>/campaigns/<month>/` and routes per channel:

| Asset                | Channel route          | Live today?                       |
|----------------------|------------------------|-----------------------------------|
| social-calendar.json | Meta Graph API         | 🟡 after Meta App Review (4-6 wk) |
| gbp-posts.json       | operator-manual paste  | 🟡 native GBP API later           |
| email.json           | Resend                 | ✅ immediately                     |
| reel.json            | FAL.AI Kling 3.0       | ✅ immediately                     |
| flyer/*.html         | Playwright → PNG       | ✅ immediately                     |

The dispatcher writes `dispatch-log.json` next to the campaign manifest
with every external_id, every cost cent, every failure reason. Idempotent
on re-runs.

During the Meta App Review window (≤ 6 weeks from registration),
social posts log `manual_required` and the operator copy-pastes from
`caption_fb` / `caption_ig` + `media_url` per slot. The same code path
goes fully automatic once `META_PAGE_ACCESS_TOKEN` / `META_FB_PAGE_ID` /
`META_IG_USER_ID` are set in `.env` — no rework needed.

---

## What we've actually shipped (commits on this branch)

1. **`adc328a`** — 12 marketing-team subagents + 9 reusable skills + CLAUDE.md
2. **`8d32fbd`** — `design/` shared system + Aditi's Kitchen Next.js site
3. **`ab56ea1`** — Aditi's Spice Depot Next.js site
4. **`58e3956`** — ChefScape Leesburg May 2026 full campaign pack
5. **`ca473b9`** — `api/` backend + Meta Graph API client + `.mcp.json`
6. **`f5eb932`** — Outstand + Resend + FAL channel clients + dispatcher (replaced)
7. **(this commit)** — Drop Outstand entirely; Meta-direct only

---

## What we don't have yet

### Critical (blocks scale past ~5 clients)

- **Meta App Review submitted** — code is ready, registration is not. The
  4-6 week clock only starts once you submit. Submit this week.
- **Supabase schema + migrations** — `clients`, `brand_profiles`,
  `monthly_intakes`, `campaigns`, `campaign_assets`, `leads`.
  Each client currently lives as a JSON file in `clients/<slug>/`.
  Fine for the three demo clients; doesn't scale to 30. Per-client
  Meta tokens need to live in the DB, not in `.env`.

### High value (next sprint)

- **GBP native API client** — replaces operator-manual paste once we
  hit ~10 clients. Separate OAuth + quota from Meta. The agent already
  produces the JSON; only the dispatch path changes.
- **Stripe** — required to actually charge $497/mo. Not blocking demos,
  blocking the first paying client.
- **`analytics-reporter` agent** — at month-end, reads last month's
  `dispatch-log.json` + Meta insights + Resend opens and drafts a
  1-pager for the client. Proves the agency delivered.
- **Monthly cron** — Railway scheduled job that runs the generators
  + dispatcher on the 1st of each month. Trivial once Supabase + dispatcher
  exist.

### Foundation

- **Aditi's May 2026 campaign packs** — generated for ChefScape, not for
  Aditi's two brands yet. Same flow, ~30 min of work each.
- **Per-client `META_PAGE_ACCESS_TOKEN`** storage in Supabase — currently
  one set of env vars; need per-client rows once we have multiple FB Pages.

---

## What the goal really requires

The user's framing: "we are essentially replacing the whole marketing
team for small businesses in all aspects."

A real marketing team for one SMB costs $2-5k/mo. We charge $497/mo +
$149 onboarding. That math only works because:

1. **One operator runs the whole stack** — no FTEs.
2. **The agents do the strategy + writing** that an account manager + 
   copywriter would do (~$60/hr × 12 hr/mo per client = $720). ✅ done.
3. **The dispatcher does the publishing** programmatically — no media buyer
   or social manager manually scheduling posts. ✅ wired for Resend + FAL
   today, Meta + GBP wired in code but waiting on their respective gates.
4. **The operator only does the irreducible humans-required parts**:
   approving copy, posting review responses, WhatsApp broadcast,
   GBP paste, and (until Meta approves) FB/IG paste. We've isolated
   exactly what's left for the human; everything else automates.

The risk we *don't* address yet: the operator's manual paste backlog
during the Meta App Review window. For 1-3 clients that's ~30 min/day
of paste work. For 10+ clients it's untenable. Action: register Meta
App on day 1 of every onboarded client.

---

## Bottom line

We have the **brains** of a marketing team fully built — 12 agents +
9 skills + a shared design system + two delivered websites + one full
monthly campaign pack proving the system generalizes outside our
default target market.

We have the **hands** for everything except FB/IG/GBP publishing
during their respective approval/build gates. Once those gates clear,
the same dispatcher routes everything end-to-end without code changes.

The path forward is concrete: submit Meta App Review this week, port
the Python scrapers, generate Aditi's May packs, set up Supabase
schema, write the monthly cron. None of these are research problems.
