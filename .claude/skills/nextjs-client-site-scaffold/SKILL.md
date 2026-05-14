---
name: nextjs-client-site-scaffold
description: Bootstrap a new client marketing website under `clients/<slug>/site/`. Used by website-developer. Stack is locked Next.js 15 + TypeScript strict + Tailwind 4 + shadcn/ui base + Source Serif 4 / Inter via next/font. Pulls content from `brand_profile` and `monthly_intakes`.
---

# Next.js client-site scaffold

## When to use this

A new client is onboarded and the `brand_profile` is ready. Or a
client is two-brand (Aditi's: Spice Depot + Kitchen) and needs a
separate `site/` for each brand.

## Locked stack (do not deviate)

- Next.js 15 (app router, no `src/` dir, no import alias)
- TypeScript strict
- Tailwind CSS 4
- shadcn/ui base primitives (`button`, `card`, `separator`)
- Fonts: Source Serif 4 (display) + Inter (body) via `next/font/google`
- No CMS in v1. Content lives in TS modules under `content/`.
- No analytics, no pixel, no GTM in v1.

## Bootstrap commands

```bash
mkdir -p clients/<slug>/site
cd clients/<slug>/site

# Bootstrap Next.js
npx create-next-app@latest . \
  --ts --tailwind --app --no-src-dir --no-import-alias --use-npm \
  --eslint --no-turbopack

# shadcn/ui
npx shadcn@latest init -y
npx shadcn@latest add button card separator

# (optional) framer-motion for restrained transitions
npm install framer-motion

# Verify build
npm run build
```

## Directory structure after scaffold

```
clients/<slug>/site/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                  # home
│   ├── menu/page.tsx             # restaurants
│   ├── locations/page.tsx        # multi-location
│   ├── contact/page.tsx
│   └── globals.css
├── components/
│   ├── Hero.tsx
│   ├── MenuSection.tsx
│   ├── LocationCard.tsx
│   ├── HoursTable.tsx
│   ├── CulturalAccent.tsx        # rangoli / banana-leaf SVGs
│   └── Footer.tsx
├── content/
│   └── brand.ts                  # imports from brand_profile
├── public/
│   ├── photos/                   # from monthly_intakes
│   └── favicon.ico
├── tailwind.config.ts
├── package.json
└── README.md
```

## `content/brand.ts` shape

```ts
export const brand = {
  name: "Aditi's Kitchen",
  parallelLabel: "अदिति की रसोई",      // optional, Devanagari sub-label
  category: "south-indian-veg",
  tagline: "Real South Indian, fresh dosas, open Tue–Sun.",
  signatureItems: [
    { name: "Mysore Masala Dosa", price: "$11.99", note: "16-hour fermented batter" },
    { name: "Ghee Roast", price: "$10.99", note: "" },
  ],
  locations: [
    {
      label: "Ashburn",
      address: "12345 Loudoun Rd, Ashburn, VA 20147",
      phone: "(703) XXX-XXXX",         // TODO: real phone
      hours: { mon: null, tue: "11:00-21:00", wed: "11:00-21:00", thu: "11:00-21:00", fri: "11:00-21:00", sat: "11:00-21:00", sun: "11:00-21:00" },
      mapsUrl: "https://maps.google.com/...",
    },
  ],
  palette: {
    primary: "#2F5D3A",   // Kerala green
    accent:  "#C97B3A",   // saffron
    neutral: "#F5EFE6",   // warm offwhite
    ink:     "#1F2421",
  },
  culturalAccent: "banana-leaf",        // "rangoli" | "banana-leaf" | "mehendi" | "diya"
  links: {
    instagram: "https://instagram.com/aditiskitchen",
    facebook: null,
    googleMaps: "https://maps.google.com/...",
  },
} as const;
```

## `app/layout.tsx` skeleton

```tsx
import type { Metadata } from "next";
import { Source_Serif_4, Inter } from "next/font/google";
import { brand } from "@/content/brand";
import "./globals.css";

const serif = Source_Serif_4({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-serif" });
const sans = Inter({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: brand.name,
  description: brand.tagline,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${serif.variable} ${sans.variable}`}
      style={{
        // @ts-expect-error CSS custom properties
        "--color-primary": brand.palette.primary,
        "--color-accent": brand.palette.accent,
        "--color-neutral": brand.palette.neutral,
        "--color-ink": brand.palette.ink,
      }}
    >
      <body className="bg-[var(--color-neutral)] text-[var(--color-ink)] antialiased">
        {children}
      </body>
    </html>
  );
}
```

## `app/page.tsx` skeleton

```tsx
import { brand } from "@/content/brand";
import { Hero } from "@/components/Hero";
import { MenuSection } from "@/components/MenuSection";
import { LocationCard } from "@/components/LocationCard";
import { Footer } from "@/components/Footer";
import { CulturalAccent } from "@/components/CulturalAccent";

export default function Home() {
  return (
    <main>
      <Hero
        parallelLabel={brand.parallelLabel}
        headline={brand.name}
        subhead={brand.tagline}
        ctaLabel={`Call ${brand.locations[0].phone}`}
        ctaHref={`tel:${brand.locations[0].phone.replace(/\D/g, "")}`}
      />
      <CulturalAccent kind={brand.culturalAccent} />
      <MenuSection title="Signature dishes" items={brand.signatureItems} />
      <section className="px-6 md:px-12 py-12">
        <h2 className="font-serif text-4xl mb-6">Find us</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {brand.locations.map((loc) => (
            <LocationCard key={loc.label} {...loc} />
          ))}
        </div>
      </section>
      <Footer brand={brand} />
    </main>
  );
}
```

## `globals.css` baseline

```css
@import "tailwindcss";

@theme {
  --font-serif: var(--font-serif);
  --font-sans: var(--font-sans);
  --color-primary: var(--color-primary);
  --color-accent: var(--color-accent);
  --color-neutral: var(--color-neutral);
  --color-ink: var(--color-ink);
}

body { font-family: var(--font-sans); }
h1, h2, h3, .font-serif { font-family: var(--font-serif); }

/* Subtle motion only */
* { transition-property: color, background-color, opacity; transition-duration: 200ms; }
```

## Hard rules

- **No `src/` directory.** App router only.
- **No CSS-in-JS.** Tailwind v4 + globals.css only.
- **No tracking scripts in v1.**
- **No CMS in v1.** All content compile-time from `content/brand.ts`.
- **No homepage hero carousel.** One hero image (or no image),
  one CTA, one fold.
- **Real content only.** Missing fields render `<TODO label="…" />`
  in red border.
- **Run `npm run build` before declaring scaffold done.** If it fails,
  it's not done.

## TODO marker component

```tsx
export function TODO({ label }: { label: string }) {
  return (
    <span className="inline-block px-2 py-0.5 rounded border-2 border-red-500 text-red-600 text-xs font-mono">
      TODO: {label}
    </span>
  );
}
```

## Soft rules

- Mobile-first viewport: 360px.
- All photos via `next/image`, with width/height props (no fill mode
  unless explicitly framed).
- `<a href="tel:...">` for phone CTAs.
- The Devanagari/Tamil/Malayalam parallel label is small (12-16px),
  letter-spaced wide, opacity 0.7. Skip entirely if it feels like
  decoration rather than identity.

## What you do NOT do

- Do not scaffold `web/` (the agency's own site — deferred per
  CLAUDE.md §11).
- Do not generate routes the client doesn't need (`/blog`, `/about/team`
  are stretch).
- Do not introduce Turborepo / Nx for the second or third site. Two
  duplicated `package.json` files is fine.
- Do not write campaign copy here — content comes from brand_profile
  + monthly_intakes via TypeScript modules.
