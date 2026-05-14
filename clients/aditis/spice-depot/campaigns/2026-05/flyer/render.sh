#!/usr/bin/env bash
# Render the Aditi's Spice Depot — 10% Spring Sale flyer to PNG.
# Run from this directory: bash render.sh
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HTML="${DIR}/spring-sale-10pct.html"
PNG="${DIR}/spring-sale-10pct.png"

# Requires Node + npx (Playwright auto-downloads browser binaries on first run).
npx --yes playwright screenshot \
  --viewport-size=1080,1350 \
  --browser=chromium \
  --wait-for-timeout=2000 \
  "file://${HTML}" \
  "${PNG}"

echo "Rendered: ${PNG}"
