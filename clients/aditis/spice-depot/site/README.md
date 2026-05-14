# Aditi's Spice Depot — site

Next.js 15 marketing site for Aditi's Spice Depot — two locations in
Loudoun County, VA (Ashburn + Herndon).

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

- `content/brand.ts` — single source of truth for hours, catalog,
  locations, featured products, promo strip, palette. Edit this to
  change visible content.
- `app/` — Next.js 15 app router routes (`/`, `/catalog`, `/contact`).
- `components/` — Hero, PromoStrip, FeaturedProducts, CatalogSection,
  LocationCard, HoursTable, CulturalAccent, Footer, TODO.
- `lib/` — design tokens, font setup, cultural-accent SVG data (shared
  with the Kitchen site at scaffold time).

## Before launch (TODO)

These fields need real values before the site goes live:

- [ ] Phone numbers in `content/brand.ts` (`locations[0].phone` and
      `locations[1].phone`)
- [ ] Verify both street addresses with the owner (Ashburn + Herndon)
- [ ] Replace `price: "TODO"` values in `brand.catalog` with real shelf
      prices
- [ ] Add Google Maps share URLs for both locations
      (`locations[].mapsUrl`)
- [ ] Add real product photos to `public/photos/` and wire them into
      `FeaturedProducts` if desired
- [ ] Add Instagram / Facebook handles if either store is active
      (`brand.links`)
- [ ] Confirm the Spring Sale dates (`brand.promo.message`) before
      May 31 expires; rotate to the next campaign hook after that

Search the codebase for `<TODO />` markers and `// TODO:` comments —
they flag missing data during review.

## Deploy

Push to a Vercel project that watches this directory:
`clients/aditis/spice-depot/site/`. No additional config needed.
