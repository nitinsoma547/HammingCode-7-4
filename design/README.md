# design/ — shared design system for client sites

Source-of-truth for design tokens, fonts, and reference components used
across every client site under `clients/<slug>/site/`.

## How this is consumed (v1)

With only 2-3 client sites, we don't run a monorepo workspace. Instead,
when `website-developer` scaffolds a new client site:

1. It reads tokens / components from this folder as a reference.
2. It copies the relevant files into `clients/<slug>/site/lib/` and
   `clients/<slug>/site/components/`.
3. The site's TypeScript imports stay local — no cross-project paths.

When the 4th client site ships, we extract this folder into a proper
internal workspace package. Until then, each site is self-contained.

## What's here

- `tokens.ts` — color scales, spacing rhythm, type scale, radii.
  Per-client palette overrides live in each site's `content/brand.ts`.
- `fonts.ts` — `next/font/google` setup for Source Serif 4 (display)
  and Inter (body). Both OFL.
- `components/` — reference implementations of Hero, MenuSection,
  LocationCard, HoursTable, CulturalAccent, Footer. Each is small,
  takes brand props, and uses CSS variables from tokens.
- `cultural-accents/` — SVG path data for the rangoli, banana-leaf,
  mehendi, and diya motifs used in `<CulturalAccent />`.

## What's NOT here

- Per-client content (menus, locations, palette specifics) — lives in
  the client's site under `content/brand.ts`.
- Photos — never check binary photos into `design/`. Photos belong in
  the client's site `public/photos/`.
- Marketing-specific copy — handled by the writing agents at runtime,
  not baked into the design system.
