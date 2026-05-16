# Marketing Team

A 10-role marketing team built on top of the 40 marketing skills in this plugin. Each role is a Claude Code subagent: invoke one directly for a focused task, or start with `cmo` for cross-functional briefs.

## The roster

| Subagent | Owns | Invoke when… |
|---|---|---|
| `cmo` | Orchestration | You have a multi-channel brief, a growth plan, a launch — anything spanning more than one specialty |
| `seo-lead` | ai-seo, seo-audit, programmatic-seo, schema, site-architecture | Organic search, AI search visibility, technical SEO, content architecture for ranking |
| `performance-marketer` | ads, ad-creative, analytics, aso | Paid acquisition on any platform, conversion tracking, ASO |
| `cro-specialist` | cro, ab-testing, signup, paywalls, popups, marketing-psychology | A page or flow isn't converting; you want to A/B test something |
| `content-marketer` | copywriting, copy-editing, content-strategy | Marketing copy that needs writing or fixing; editorial planning |
| `lifecycle-marketer` | emails, cold-email, onboarding, churn-prevention | Email sequences, onboarding flows, retention, cold outbound |
| `growth-marketer` | referrals, lead-magnets, free-tools, launch, marketing-ideas, directory-submissions | Non-paid growth tactics, launches, viral mechanics, brainstorms |
| `product-marketer` | product-marketing, pricing, sales-enablement, competitor-profiling, competitors, customer-research | Positioning, messaging, pricing, ICP, competitive work, sales decks |
| `brand-social` | social, video, image, community-marketing, co-marketing | Organic social, short-form video, AI visuals, community, partnerships |
| `revops-analyst` | revops, analytics | Lead scoring, lifecycle stages, attribution, analytics setup, unit economics |

## How it works

Every agent reads the shared product-marketing context from `.agents/product-marketing.md` (also checks `.claude/product-marketing.md` and the legacy `product-marketing-context.md`). If it doesn't exist, the `product-marketer` agent creates it — and the rest of the team reads it from then on.

When you invoke `cmo`, it decomposes the brief and delegates to specialists in parallel where possible, then reconciles their output into a single plan.

## Recommended first run

If this is a new project, start with:

> Use the product-marketer agent to interview me about the product and write a product-marketing context file.

Then everything else has a foundation.
