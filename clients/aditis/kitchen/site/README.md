# Aditi's Kitchen — site

Next.js 15 marketing site for Aditi's Kitchen, Ashburn VA.

## Run locally

```bash
npm install
npm run dev
# open http://localhost:3000
```

## Build

```bash
npm run build
```

## What's where

- `content/brand.ts` — single source of truth for hours, menu,
  locations, palette. Edit this to change visible content.
- `app/` — Next.js 15 app router routes (`/`, `/menu`, `/contact`).
- `components/` — Hero, MenuSection, LocationCard, HoursTable,
  CulturalAccent, Footer.
- `lib/` — design tokens, font setup, cultural-accent SVG data (copied
  from the repo-root `design/` folder at scaffold time).

## Before launch (TODO)

These fields need real values before the site goes live:

- [ ] Phone number in `content/brand.ts` (`locations[0].phone`)
- [ ] Verify street address with the owner
- [ ] Add real food photos to `public/photos/`
- [ ] Confirm menu prices with the owner
- [ ] Add Instagram / Facebook handles if active
- [ ] Add Toast or call-to-reserve link if applicable

Search the codebase for `<TODO />` markers — they render as visible
red-bordered chips so missing data is obvious during review.

## Deploy

Push to a Vercel project that watches this directory:
`clients/aditis/kitchen/site/`. No additional config needed.
