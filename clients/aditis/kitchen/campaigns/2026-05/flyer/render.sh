#!/usr/bin/env bash
# Render the Akshaya Tritiya sadya flyer to PNG.
# Run from this directory: bash render.sh
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HTML="${DIR}/akshaya-tritiya-sadya.html"
PNG="${DIR}/akshaya-tritiya-sadya.png"

# Requires Node + npx (Playwright auto-downloads browser binaries on first run).
npx --yes playwright screenshot \
  --viewport-size=1080,1350 \
  --browser=chromium \
  --wait-for-timeout=2000 \
  "file://${HTML}" \
  "${PNG}"

echo "Rendered: ${PNG}"
