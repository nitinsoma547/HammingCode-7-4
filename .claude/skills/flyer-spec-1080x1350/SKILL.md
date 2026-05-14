---
name: flyer-spec-1080x1350
description: Produce the HTML/CSS source for a 1080x1350 PNG flyer (promo, festival, event). Used by visual-designer. The output is rendered to PNG via headless Playwright, never via image-generation models. Typography-led, restrained, with at most one subtle cultural accent.
---

# Flyer spec — 1080 × 1350

## Why this size

1080×1350 is the IG portrait sweet spot AND prints to roughly 3.6×4.5"
at 300 DPI — the size that fits a takeout-counter clip frame in a Loudoun
shop. One asset, two channels.

## File layout

```
clients/<slug>/assets/<month>/
├── flyer-<topic>.html
├── flyer-<topic>.css
├── flyer-<topic>.json    # palette + fonts + spec metadata
├── render.sh
└── flyer-<topic>.png     # output after render.sh runs
```

## HTML skeleton

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Flyer</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@600;700&family=Inter:wght@400;500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="./flyer-<topic>.css">
</head>
<body>
  <div class="flyer">
    <!-- Optional Devanagari/Tamil/Malayalam parallel label, very small -->
    <div class="parallel-label">अदिति की रसोई</div>

    <!-- Headline -->
    <h1 class="headline">Vishu Sadya</h1>
    <p class="subhead">Sunday, April 14 — banana-leaf feast</p>

    <!-- Optional photo (placed via CSS background-image, single crop) -->
    <div class="photo"></div>

    <!-- Body — 3-5 short lines max -->
    <ul class="body">
      <li>20 items on the leaf</li>
      <li>Two seatings: 12pm & 2pm</li>
      <li>$24 per plate</li>
    </ul>

    <!-- CTA -->
    <div class="cta">
      <span class="phone">(703) XXX-XXXX</span>
      <span class="hours">Tue–Sun · 12345 Loudoun Rd, Ashburn</span>
    </div>

    <!-- Cultural accent (SVG, low opacity) -->
    <svg class="accent" viewBox="..." aria-hidden="true">
      <!-- single line motif: rangoli / banana leaf / mehendi -->
    </svg>
  </div>
</body>
</html>
```

## CSS conventions

```css
:root {
  --bg: #F5EFE6;     /* warm offwhite, from brand_profile.visual_palette */
  --ink: #1F2421;
  --primary: #2F5D3A;
  --accent: #C97B3A;
  --margin: 64px;
}

body { margin: 0; background: var(--bg); }

.flyer {
  width: 1080px;
  height: 1350px;
  padding: var(--margin);
  position: relative;
  font-family: 'Inter', system-ui, sans-serif;
  color: var(--ink);
}

.headline {
  font-family: 'Source Serif 4', Georgia, serif;
  font-weight: 700;
  font-size: 96px;
  line-height: 1.05;
  margin: 0 0 16px;
  color: var(--primary);
}

.subhead {
  font-family: 'Source Serif 4', Georgia, serif;
  font-weight: 400;
  font-size: 28px;
  margin: 0 0 48px;
  color: var(--ink);
  opacity: 0.85;
}

.parallel-label {
  font-size: 22px;
  letter-spacing: 0.08em;
  margin-bottom: 24px;
  opacity: 0.7;
  /* Devanagari renders via system fonts on the runtime; no special @font-face */
}

.accent {
  position: absolute;
  bottom: 64px;
  right: 64px;
  width: 220px;
  opacity: 0.18;
  fill: var(--primary);
}

/* Print safety: keep all text ≥ 80px from edges */
```

## render.sh

```bash
#!/usr/bin/env bash
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
HTML="${DIR}/flyer-<topic>.html"
PNG="${DIR}/flyer-<topic>.png"
npx --yes playwright screenshot \
  --viewport-size 1080,1350 \
  --browser chromium \
  --full-page=false \
  "file://${HTML}" \
  "${PNG}"
echo "Rendered: ${PNG}"
```

## Layout patterns (pick one per flyer)

### A) Photo-led (dish flyer)
- Photo occupies top 45-50% (background-image, object-fit: cover).
- Headline directly below photo, left-aligned.
- Body list (3 bullets max).
- CTA pinned to bottom 12% with a thin top-border in primary color.
- Cultural accent: small motif, bottom-right corner, opacity 0.15.

### B) Type-led (festival flyer, no photo)
- Whitespace top 25%.
- Parallel-label small at top.
- Headline center, large (96-120pt).
- Subhead below.
- Body list (3-4 short lines).
- CTA bottom 12%.
- Cultural accent: top-right or full-width thin divider at 33% height.

### C) Two-location stacked (Aditi's Spice Depot)
- Headline top.
- Two location blocks side-by-side OR stacked, each with: location name,
  address, phone, hours.
- Promo strip in accent color (e.g., "10% Spring Sale").
- CTA: "Walk in any day."

## Hard rules

- No CSS gradients on backgrounds. A 5% color wash overlay is OK; a
  rainbow gradient is not.
- No drop shadows on text. No text-stroke. No outer glow.
- No emoji in the flyer body.
- All text reads cleanly at 50% zoom-out (i.e., from across the room
  if printed and clipped on a counter).
- Cultural accent opacity ≤ 0.25. Stronger reads as wallpaper.
- One accent per flyer. Not two.

## Operator handoff

- Output the .html + .css + render.sh files. Operator runs render.sh
  locally to produce the PNG.
- Note in the spec JSON which photo from monthly_intake was used and
  which were rejected.
