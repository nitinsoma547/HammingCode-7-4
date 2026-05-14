---
name: kling-image-to-video-prompt
description: Write the FAL.AI / Kling 3.0 image-to-video prompt for a Reel. Used by video-producer. Image-to-video only — we never text-to-video. The prompt controls camera, motion, lighting, and most importantly the negative_prompt that keeps Kling from producing AI-slop output (sparkles, distortions, neon).
---

# Kling 3.0 image-to-video prompt

## What Kling 3.0 is good at

- Subtle ambient motion on a still photo (steam rising, oil shimmer,
  hair moving slightly, fabric ripple).
- Holding the subject steady while a single environmental element moves.
- 5-second clips at 720p or 1080p.

## What Kling 3.0 will do badly if you let it

- "Magical" effects (sparkles, glitter, color-shift, glow).
- Subject morphing (hands gaining fingers, plates melting, faces
  shifting).
- Fast zooms or pans (looks like a stock-template intro).
- Inserting things not in the source photo (a hand appearing,
  a plate of food appearing).

## Prompt structure

```json
{
  "model": "fal-ai/kling-video/v1/standard/image-to-video",
  "image_url": "<https URL to the source photo>",
  "prompt": "<one to three short clauses describing motion + camera>",
  "duration_seconds": 5,
  "cfg_scale": 0.5,
  "negative_prompt": "<the canonical negative list — see below>"
}
```

## Canonical motion prompts by subject

### Food (dish, plate)
```
Steam rising slowly from the [dish]. Subtle ghee/oil shimmer on the
crust. Camera holds still. Natural daylight. No zoom.
```

### Food (drink, chai/coffee)
```
Steam curls up from the cup. Light reflects gently on the rim. Camera
holds still. No zoom.
```

### Hands plating / cooking process
```
Hands work slowly and steadily on the [task]. Camera holds still.
Natural light. No zoom.
```

### Spice / ingredient closeup
```
Subtle ambient motion — light dust catches the air. Camera holds
still. Natural light. No zoom.
```

### Salon / mehendi
```
Hand holds steady; subtle breathing motion. Camera holds still.
Soft natural light. No zoom.
```

## Canonical negative prompt (always include)

```
extra fingers, distorted hands, melting, AI artifacts, fast zoom,
color shift, neon, sparkles, glitter, glow, blur, fish-eye, rotating,
extra plates, extra dishes, morphing, magical effects, fake bokeh,
warping, oversaturation, motion blur on subject
```

## Duration

- v1 cap: **5 seconds.** Kling 3.0 5s standard tier ≈ $0.50.
- 10s tier ≈ $1.00. Operator approval only.
- Reels at 5s loop well in IG; viewers see them twice before scrolling.

## cfg_scale guidance

- 0.5 = Kling's recommended default. Use this unless the output is
  clearly drifting from the source photo.
- 0.4 = slightly tighter to source. Use if the subject is identity-
  critical (a specific dish people know).
- 0.6 = looser. Avoid in v1 — increases hallucination risk.

## Aspect ratio

Kling 3.0 outputs 16:9 by default. For Reels, ensure the source
photo is portrait (9:16) or near-square so the framing works. Don't
ask Kling to re-frame a landscape photo into portrait — the result
is always bad.

## Failure path

If Kling output has visible artifacts on 2 consecutive submissions:
- Pick a different source photo.
- If no acceptable photo exists in `monthly_intakes.photo_urls`, skip
  the Reel for the month, refund the slot to next month, flag to
  operator.

Do not paper over a bad clip with "creative editing."
