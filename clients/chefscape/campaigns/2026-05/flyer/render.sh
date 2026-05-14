#!/usr/bin/env bash
# Render the Memorial Day grill-prep class flyer to PNG.
# Run from this directory: bash render.sh
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HTML="${DIR}/memorial-day-grill-class.html"
PNG="${DIR}/memorial-day-grill-class.png"

# Requires Node + npx (Playwright auto-downloads browser binaries on first run).
npx --yes playwright screenshot \
  --viewport-size=1080,1350 \
  --browser=chromium \
  --wait-for-timeout=2000 \
  "file://${HTML}" \
  "${PNG}"

echo "Rendered: ${PNG}"
