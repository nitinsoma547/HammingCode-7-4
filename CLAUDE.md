# CLAUDE.md — The Business (AI Marketing Agency)

Operational spec for an AI-run, full-service marketing agency for South Asian
small businesses in Ashburn / Herndon / Loudoun County, VA. Operating as a
freelance practice under the owner's name; brand identity deferred until
≥5 paying clients.

This file tells future Claude Code sessions what to build, where files go,
which integrations to call, and what NOT to do. Read it first every session.

---

## 1. Service & Pricing

- **Flat price:** $497 / month + $149 one-time onboarding. No tiers.
- **No paid ads.** Organic only. Do not add a paid-ads module.
- **Billing:** Stripe subscription, auto-charges on the 1st.
- **First-client offer:** Aditi's Spice Depot / Aditi's Kitchen gets month 1
  free (proof of concept via Ravi Marri).
- **Infra budget ceiling:** ~$20 / month at 10 clients. If a design decision
  pushes us over this, flag it and propose alternatives instead of shipping.

### What clients get each month

- Social posts on Facebook + Instagram (scheduled via Outstand)
- Google Business Profile posts (Outstand)
- AI-generated Reels: image-to-video via FAL.AI / Kling 3.0 from client photos
- Email blast (Resend)
- WhatsApp copy (client copy-pastes — semi-manual by design)
- Flyers (PNG, 1080×1350, generated assets)
- 30-day content calendar
- Review response drafts
- Seasonal / cultural campaign hooks (Diwali, Onam, Holi, Ramadan, etc.)

---

## 2. Target Market

South Asian SMBs in Ashburn / Herndon / Loudoun:

- Restaurants (esp. South Indian, Indo-Chinese, biryani, sweets)
- Spice / grocery shops
- Salons, threading, mehendi
- Tutoring centers (math, Kumon-likes, music, dance)

Cultural fluency matters. Generators must support seasonal hooks listed above
and idiomatic English for the diaspora audience. Do not default to generic
"American restaurant" copy.

---

## 3. Tech Stack (locked)

| Layer            | Choice                                  | Notes |
|------------------|-----------------------------------------|-------|
| Content gen      | Claude Haiku via Anthropic SDK          | `claude-haiku-4-5-20251001` |
| Social posting   | Meta Graph API direct (`api/src/services/meta/`) | FB Pages + IG Business; Outstand as fallback during Meta App Review |
| Social posting (fallback) | Outstand (FB / IG / GBP)       | $0.01 / post, no monthly fee — used while Meta App Review pending |
| Video            | FAL.AI → Kling 3.0 (image-to-video)     | ~$0.50 / clip |
| Email            | Resend                                  | Free tier |
| Backend          | Node.js (TypeScript) on Railway         | Same provider as QuikRecap |
| Database         | Supabase (Postgres)                     | Brand profiles + campaign history |
| Payments         | Stripe                                  | Subscriptions + one-time onboarding |
| Frontend         | React + Vercel                          | **Defer until ≥5 clients** |
| Lead gen         | Python + Google Places API              | Local scripts, not deployed |

### Why these specifically

- **Haiku, not Sonnet/Opus:** Per-client content costs must stay <$1/month of
  inference. Use Sonnet only if Haiku output for a specific generator (e.g.
  cultural campaign hooks) fails QA — and gate it behind config.
- **Meta Graph API direct, not just Outstand:** owning the integration removes
  per-post fees, ToS-restriction risk at scale, and middleman ratelimits.
  Requires Meta App Review (4–6 weeks per their May 2026 docs) for
  `instagram_content_publish` + `pages_manage_posts`. Outstand stays wired as
  a fallback path so we can ship before App Review approves.
- **Image-to-video, not text-to-video:** Clients send real photos via
  WhatsApp; we animate them. Avoids the "AI slop" look that hurts trust with
  this audience.

---

## 4. Monthly Workflow (the system we are automating)

1. **Onboarding (once per client):** Google Form → Supabase `clients` +
   `brand_profiles` row. 7 sections, 40+ questions.
2. **Monthly intake:** Client fills 4-question form + sends new photos via
   WhatsApp.
3. **Generation:** `services/campaign-generator` calls Haiku with the brand
   profile + intake + month/season context. Produces:
   - Social post pack (FB/IG variants)
   - GBP post
   - Email blast (subject + body)
   - WhatsApp message
   - Reel script + image selection for FAL.AI
   - Review response templates
4. **Video:** Selected photos → FAL.AI/Kling → MP4s.
5. **Scheduling:** Outstand API receives FB/IG/GBP posts + media.
6. **Email:** Resend fires the blast on the scheduled date.
7. **WhatsApp:** Owner forwards the generated message to client; client
   copy-pastes to their broadcast list (30 sec of their time).
8. **Billing:** Stripe auto-charges on the 1st of the month.

Anything that can't be fully automated (WhatsApp, some GBP edge cases) is
**explicitly semi-manual**. Do not invent fragile automation for these.

---

## 5. Repo Layout

```
/
├── CLAUDE.md                 # this file
├── .claude/
│   ├── agents/               # 12 marketing-team subagents (see §14)
│   └── skills/               # 9 reusable playbooks (see §15)
├── design/                   # shared design system for client sites
│   ├── tokens.ts             # color scales, spacing, radii
│   ├── fonts.ts              # next/font setup (Source Serif 4 + Inter)
│   └── components/           # Hero, MenuSection, LocationCard, etc.
├── api/                      # Node.js + TS backend (Railway)
│   ├── src/
│   │   ├── routes/           # HTTP endpoints (webhooks, internal admin)
│   │   ├── services/
│   │   │   ├── claude/       # Haiku prompts + campaign generators
│   │   │   ├── outstand/     # social scheduling client
│   │   │   ├── resend/       # email client
│   │   │   ├── fal/          # video generation client
│   │   │   └── stripe/       # billing
│   │   ├── jobs/             # cron / queue handlers (monthly run)
│   │   ├── lib/              # supabase client, logger, config
│   │   └── index.ts
│   └── package.json
├── db/
│   ├── migrations/           # Supabase SQL migrations
│   └── seed/                 # demo data (e.g. Aditi's)
├── scrapers/                 # Python — local lead gen
│   ├── dying_business_scraper.py
│   ├── social_checker.py
│   └── requirements.txt
├── clients/                  # per-client deliverables
│   └── aditis/
│       ├── spice-depot/
│       │   ├── site/         # Next.js 15 marketing site
│       │   ├── assets/       # flyers, IG graphics by month
│       │   ├── campaigns/    # monthly content packs (JSON)
│       │   └── seo-audit.md
│       └── kitchen/
│           ├── site/
│           ├── assets/
│           ├── campaigns/
│           └── seo-audit.md
└── web/                      # Agency's own site — DEFERRED until 5 clients
```

Add directories only when the first file inside is being written. Empty
scaffolding directories are noise.

---

## 6. Data Model (Supabase)

Minimum viable tables for v1. Do not add tables speculatively.

- **`clients`** — id, business_name, owner_name, phone, whatsapp, email,
  address, city, gbp_url, fb_handle, ig_handle, status (trial/active/paused),
  stripe_customer_id, stripe_subscription_id, onboarded_at.
- **`brand_profiles`** — client_id (FK), cuisine_or_category, tone_keywords[],
  signature_dishes_or_products[], languages[], cultural_hooks[],
  do_not_say[], visual_palette, locations (jsonb).
- **`monthly_intakes`** — client_id, month (YYYY-MM), promotions[],
  events[], photo_urls[], notes, submitted_at.
- **`campaigns`** — client_id, month, status (draft/scheduled/sent),
  generated_at, model_used, total_cost_cents.
- **`campaign_assets`** — campaign_id, channel (fb/ig/gbp/email/whatsapp/
  reel/flyer/review), payload (jsonb), media_urls[], scheduled_for,
  outstand_id, resend_id, fal_job_id.
- **`leads`** — from scrapers: place_id, name, category, address, rating,
  review_count, has_website, has_gbp_posts, score, outreach_script,
  contacted_at, status.

Use `client_id` as the foreign-key root everywhere. Cost tracking lives on
`campaigns.total_cost_cents` so we can verify the <$1/client/month target.

---

## 7. Lead Generation

Two Python scripts, run locally — not part of the deployed system.

- **`scrapers/dying_business_scraper.py`** — Google Places API. Filters: rating
  < 4.0 OR review_count < 20 OR no website OR weak GBP posting cadence.
  Scores 0–100, ranks hottest→coldest. Outputs CSV + writes to Supabase
  `leads`.
- **`scrapers/social_checker.py`** — Enriches leads with FB/IG handle
  presence, last post date, follower count buckets. Generates a personalized
  outreach script per lead (Claude Haiku, 2–3 sentences, references the
  specific gap).

Primary outreach is **in-person + WhatsApp** in the desi community. The
scrapers exist to prioritize who to walk into next, not to email-blast.

---

## 8. Content Generation Conventions

When building any generator in `api/src/services/claude/`:

- Always pass: `brand_profile`, current `monthly_intake`, `month`, `season`
  (Spring/Summer/Fall/Winter), and any `cultural_hooks` active in that month
  (Diwali in Oct/Nov, Onam in Aug/Sep, Holi in Mar, Ramadan windows, etc.).
- Default model: `claude-haiku-4-5-20251001`. Use prompt caching on the
  brand profile + system prompt — they're stable across a client's month.
- Output must be structured JSON, never freeform prose, so downstream
  schedulers can consume it without parsing.
- Every generator records `total_cost_cents` on the campaign row.
- Respect `brand_profiles.do_not_say` as a hard filter. If output violates
  it, regenerate up to 2x then surface to the operator.
- Tone defaults: warm, family-run, specific (name the dish / the spice /
  the teacher). Avoid generic "delicious authentic cuisine" filler.

---

## 9. Integration Notes

- **Meta Graph API (`api/src/services/meta/`):** Direct Facebook Pages + Instagram
  Business publishing. Requires Meta App Review for `instagram_content_publish`
  and `pages_manage_posts` (4–6 weeks per Meta's May 2026 docs). Per-client
  Page Access Tokens stored in Supabase `clients` table. Rate limit: 200
  API calls / hour / IG account. Pin Graph API version (default v21.0) and
  bump deliberately. Token refresh job pings `/me` weekly per client. See
  `api/src/services/meta/META_SETUP.md` for the App Review walkthrough.
- **Meta MCP server** (`.mcp.json` → `meta`): community MCP server wired for
  dev-time tool invocations from Claude Code. Production cron uses the
  TypeScript client in `api/src/services/meta/`, not the MCP server.
- **Outstand (fallback):** Per-post billing. Used while Meta App Review is
  pending. Batch sends so one campaign isn't 30 API calls if it can be one.
  Store the returned post id on `campaign_assets`. Drop once Meta is live.
- **FAL.AI Kling 3.0:** Image-to-video, ~$0.50 per clip. Cap at 1 Reel per
  client per month in v1 to keep COGS predictable. The image picker chooses
  the best photo from `monthly_intakes.photo_urls` via a Haiku call.
- **Resend:** Free tier limits — keep a single monthly blast per client.
- **Stripe:** One product, two prices: $497/mo subscription and $149
  one-time onboarding. Webhooks update `clients.status`.
- **Anthropic SDK:** Use prompt caching aggressively. Never log API keys.
  Read keys from env via `api/src/lib/config.ts` — never inline.

---

## 10. Status (as of 2026-05-14)

**Built in this repo:**

- Full agent team in `.claude/agents/` — 12 subagents covering brand
  strategy, website dev, social planning, GBP/local SEO, email,
  flyers/IG graphics, Reel production, review responses, lead gen,
  voice review, integration scaffolding, cultural calendar. See §14.
- Reusable skills in `.claude/skills/` — 9 playbooks any agent invokes:
  desi-diaspora-voice, whatsapp-broadcast-copy, monthly-content-calendar,
  kling-image-to-video-prompt, flyer-spec-1080x1350, review-response-positive,
  review-response-negative, local-seo-audit, nextjs-client-site-scaffold.
  See §15.
- Aditi's Kitchen + Aditi's Spice Depot Next.js 15 marketing sites
  under `clients/aditis/<brand>/site/` — both build clean, ~106 kB
  First Load JS, Source Serif 4 + Inter, per-brand palette + cultural
  accent. Shared `design/` source-of-truth at repo root.
- ChefScape Leesburg May 2026 full campaign pack under
  `clients/chefscape/` — demo run showing the team flexes to a
  non-desi client via `brand_profile` configuration alone.
- `api/` backend with the full channel-client surface and the campaign
  dispatcher:
  - `api/src/services/meta/` — Graph API client (FB Pages + IG Business)
  - `api/src/services/outstand/` — fallback for FB/IG/GBP while Meta App
    Review is pending
  - `api/src/services/resend/` — monthly email blast (HTML + plain-text
    fallback rendered from `body_blocks`)
  - `api/src/services/fal/` — FAL.AI Kling 3.0 image-to-video Reel
    submission + polling
  - `api/src/jobs/dispatch-campaign.ts` — reads `clients/<slug>/campaigns/<month>/`
    JSON files (social-calendar, gbp-posts, email, reel) and dispatches
    each asset to the right channel client. Writes `dispatch-log.json`
    next to the campaign manifest for auditability. Idempotent on
    re-runs. Dry-run by default; `DRY_RUN=false` goes live.
- `.mcp.json` wires the Meta community MCP server (oliverames/meta-mcp-server)
  for dev-time tool invocations from Claude Code.
- `REVIEW.md` at repo root — honest gap analysis: what we've built, what's
  missing, and the path from here to a full automated marketing team.

**Built (lives outside this repo, port in as needed):**

- Aditi's Spice Depot website v2 — Fraunces serif, earthy maximalist,
  two locations, real hours / phone / address.
- Aditi's Kitchen website v2 — South Indian veg, dosa-focused, Kerala
  green aesthetic, real menu, Tue–Sun 11AM–9PM.
- Aditi's Spice Depot promo flyer — 1080×1350, rangoli ornaments,
  10% Spring Sale, both locations.
- Aditi's Kitchen dosa flyer — banana leaf silhouettes, dosa plate
  illustration, full menu, Dosa Party seal.
- Social content pack — 8 pieces, 30-day calendar.
- Onboarding questionnaire — 7 sections, 40+ questions, Claude-powered
  campaign generator, Taj Bites fake-company demo.
- `dying_business_scraper.py` and `social_checker.py` (local).

**Rebuild plan (Saturday meeting, May 16):** redo Aditi's Spice Depot
and Aditi's Kitchen websites in the Claude.ai design language — warm
offwhite + Source Serif 4 + Inter, per-client palette accent (Kerala
green for Kitchen, saffron for Spice Depot), subtle cultural accents
(banana-leaf, rangoli, Devanagari sub-label). Use `website-developer`
agent + `nextjs-client-site-scaffold` skill.

**Not built:** any backend code. The first session that picks this up should
scaffold `api/` and `db/migrations/` per Sections 5–6.

**Saturday meeting deliverable (Ravi Marri):** show both Claude-style
website demos + both flyers + social content pack. Pitch: $497/mo,
$149 setup, month 1 free for Aditi as proof of concept.

---

## 11. Working Conventions

- **TypeScript** in `api/`. Strict mode. No `any` without a `// why:` line.
- **Python** in `scrapers/` only. Do not introduce Python in the deployed path.
- **No new top-level dirs** without updating Section 5 in this file.
- **Cost guardrail:** any change that could raise per-client monthly cost
  above $2 must be called out in the PR description, not buried.
- **No website yet.** The `web/` dir stays empty until we have 5 paying
  clients. Do not scaffold it preemptively.
- **No premature abstractions.** Three similar campaign generators is fine;
  a "generic campaign engine" is not — wait until pattern #4.
- **Secrets:** env vars only. Never commit a key. `.env.example` lives at
  repo root and is the source of truth for required variables.

---

## 12. Open Questions (resolve before building)

1. Does Outstand's API support GBP carousels, or only single-image posts?
   (Affects whether we composite locally first.)
2. FAL.AI Kling clip length cap at $0.50 — is it 5s or 10s? Drives Reel
   script length.
3. Supabase storage vs. external CDN for client photos — Supabase is
   simpler but bandwidth pricing matters at 10 clients × 30 photos × 1080p.
4. Do we want a shared "WhatsApp send confirmation" loop (client confirms
   they pasted), or is that owner-tracked manually? Affects the data model.

Answer these in PRs that touch the affected modules, not in a separate
design doc.

---

## 13. External References (verified May 2026)

Use these upstream repos / docs when wiring the locked stack. Do not
swap to a fork or community alternative without operator approval.

- Anthropic SDK (TS): https://github.com/anthropics/anthropic-sdk-typescript
- Claude Agent SDK (TS): https://github.com/anthropics/claude-agent-sdk-typescript
- Anthropic prompt caching: https://platform.claude.com/docs/en/build-with-claude/prompt-caching
- FAL.AI JS client: https://github.com/fal-ai/fal-js — package `@fal-ai/client`
  (the older `@fal-ai/serverless-client` is deprecated; do not use it)
- Kling 3.0 model page: https://fal.ai/kling-3
- Supabase: https://github.com/supabase/supabase — backend uses `@supabase/supabase-js`
- Stripe Node SDK: npm `stripe`, docs at https://docs.stripe.com
- Resend Node SDK: npm `resend`, docs at https://resend.com/docs
- Outstand API: https://www.outstand.so/docs — REST only, no official SDK
  (write our own thin client in `api/src/services/outstand/`)
- Google Places (Python): https://github.com/googlemaps/google-maps-services-python

---

## 14. Claude Code Subagents (this repo)

12 subagents live in `.claude/agents/`. Invoke them via the `Agent`
tool by name, or let Claude Code dispatch automatically based on the
agent's `description`. Architecture follows the orchestrator-workers
pattern from Anthropic's claude-cookbooks — the operator (you, the
human) is the orchestrator; each agent is a specialist worker. The
future `api/src/services/campaign-generator` will read these same
agent definitions to run automated monthly campaigns at runtime.

### Marketing-team org chart

**Foundation (run once per client at onboarding):**

- **`brand-strategist`** (sonnet) — owns the `brand_profiles` row.
  Reads the 7-section onboarding form and produces tone_keywords,
  do_not_say, signature items, cultural hooks, visual palette,
  locations. Upstream of every downstream agent.
- **`gbp-and-local-seo`** (sonnet) — initial GBP audit, NAP
  consistency check, schema spec, keyword baseline. Also runs the
  monthly GBP post pack — see "Monthly".

**Build (run once per client, then on refresh):**

- **`website-developer`** (sonnet) — scaffolds + maintains client
  Next.js 15 marketing sites under `clients/<slug>/site/`. Uses
  the `nextjs-client-site-scaffold` skill.

**Monthly (run on the campaign cycle):**

- **`cultural-calendar`** (haiku) — festival hooks for the month.
  Call this FIRST, before any content-generating agent.
- **`social-media-planner`** (haiku) — owns the 30-day FB/IG/GBP
  calendar + writes the captions. Uses `monthly-content-calendar`,
  `desi-diaspora-voice` skills.
- **`email-marketer`** (haiku) — writes the single monthly Resend
  blast (subject, preheader, body, CTA, plain-text fallback).
- **`visual-designer`** (sonnet) — produces flyer / IG graphic /
  story / email-header HTML→PNG specs. Uses `flyer-spec-1080x1350`.
- **`video-producer`** (sonnet) — one Reel per client per month.
  Picks the photo, writes the Kling 3.0 image-to-video prompt + the
  Reel caption. Uses `kling-image-to-video-prompt`.
- **`gbp-and-local-seo`** (sonnet, monthly mode) — drafts the GBP
  post pack and updates schema/citations.

**Reactive (run as triggers fire):**

- **`reputation-manager`** (haiku) — drafts review responses
  (positive + negative). Uses `review-response-positive` and
  `review-response-negative` skills. Never auto-publishes.

**Acquisition (operator-driven):**

- **`lead-gen-specialist`** (sonnet) — drives the Python scrapers,
  scores leads, drafts the 2-3 sentence outreach script.

**QA gate (run last on every generated asset):**

- **`brand-voice-reviewer`** (sonnet) — pass/fail check against
  `brand_profile`. Runs BEFORE assets ship to Outstand / Resend /
  FAL.AI.

**Infra (operator-driven, not part of campaign loop):**

- **`integration-builder`** (sonnet) — scaffolds typed API clients
  under `api/src/services/<name>/`.

### Rules for adding a 13th subagent

Document it here and explain why an existing one couldn't cover the
use case. Prefer adding a `Skill` (see §15) over a new agent when the
work is a reusable playbook rather than a distinct role.

---

## 15. Claude Code Skills (this repo)

9 reusable playbooks live in `.claude/skills/<name>/SKILL.md`. Any
agent (or the main session) can invoke them via the `Skill` tool by
name (`/skill-name` from the user's side; via Skill tool from
Claude's side). Skills exist because the same playbook applies across
multiple agents — e.g., `desi-diaspora-voice` is read by every
writing agent.

| Skill                            | Used by                          |
|----------------------------------|----------------------------------|
| `desi-diaspora-voice`            | every writing agent              |
| `whatsapp-broadcast-copy`        | social-media-planner (semi-manual handoff) |
| `monthly-content-calendar`       | social-media-planner             |
| `kling-image-to-video-prompt`    | video-producer                   |
| `flyer-spec-1080x1350`           | visual-designer                  |
| `review-response-positive`       | reputation-manager               |
| `review-response-negative`       | reputation-manager               |
| `local-seo-audit`                | gbp-and-local-seo                |
| `nextjs-client-site-scaffold`    | website-developer                |

### Rules for adding a 10th skill

A new skill makes sense when the same playbook is referenced by ≥2
agents, OR when the playbook is intricate enough that inlining it in
an agent's body would bloat the agent prompt past ~250 lines. A skill
is NOT a substitute for an agent — agents have a `model:`, a tool
allowlist, and a role; skills are pure instructions.
