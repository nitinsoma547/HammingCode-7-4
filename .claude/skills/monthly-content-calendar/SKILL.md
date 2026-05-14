---
name: monthly-content-calendar
description: Generate the 30-day social media content calendar (FB + IG + GBP) for a client. Used by social-media-planner. Returns a structured JSON schedule with per-day slot assignments, topic, channel mix, image brief, and caption stub. Caller fills in final captions.
---

# Monthly content calendar

## Inputs required

- `brand_profile` — tone, signature items, primary community, locations.
- `monthly_intake` — this month's promotions, events, photos.
- `cultural-calendar` output for the month — festival hooks + lead window.
- `month` (YYYY-MM).
- Optional: operator overrides (skip dates, double up on a date,
  alternate locations).

## Default slot mix (12 posts / month)

| Slot kind         | Count | Notes                                      |
|-------------------|-------|--------------------------------------------|
| signature_item    | 3     | Different items, different angles.         |
| cultural_hook     | 2     | Only if active in month — else seasonal.   |
| promo             | 2     | Anchored on monthly_intake promotions.     |
| behind_the_scenes | 1     | Hands, process, ingredient closeup.        |
| review_spotlight  | 1     | Highest-rated recent review, first name.   |
| location_or_team  | 1     | Multi-location → alternate; team for solo. |
| reel              | 1     | Reserve date; video-producer fills it.     |
| gbp_post          | 1     | Coordinate with gbp-and-local-seo.         |

Push to 16-20 posts in peak festival windows (Diwali, Onam, Ramadan).
Drop to 8 in low-intake months.

## Scheduling rules

- **Wed/Thu/Fri/Sat 11am or 6pm local time** for signature-item posts.
- **Tue/Wed for promo posts** (early-week awareness).
- **3-7 days before festival** for cultural_hook posts. Day-of festival
  posts arrive too late for planning.
- **Mon-noon for GBP** — Google rotates GBP cards weekly.
- **Sun/Mon for behind-the-scenes** — slower decision days, more
  scrollability.
- **Reel: Friday late afternoon or Sunday morning.** IG Reels peak
  windows for restaurants in Loudoun.
- **Reviews: spotlight within 7 days of the review posting.** Stale
  reviews lose freshness.

## Output schema

```json
{
  "client_id": "<uuid>",
  "month": "2026-05",
  "post_count": 12,
  "active_cultural_hooks": ["Vishu", "Mother's Day"],
  "posts": [
    {
      "slot_id": "2026-05-03-signature-dosa",
      "scheduled_for": "2026-05-03T11:00:00-04:00",
      "channels": ["fb", "ig"],
      "kind": "signature_item",
      "topic": "Mysore masala dosa",
      "angle": "16-hour fermented batter",
      "needs_image_from_intake": true,
      "image_intake_match_hint": "any dosa close-up",
      "caption_stub_fb": "...",
      "caption_stub_ig": "...",
      "hashtags_ig": ["#AshburnEats", "#DosaLovers", "..."],
      "cta": "tel:+17035551234"
    }
  ]
}
```

## Hard rules

- **No two consecutive signature_item posts on the same dish.** Rotate.
- **Cultural_hook count = 0 if no hook is active.** Don't force a
  generic "Happy Sunday!" post into the slot — replace with another
  signature.
- **`do_not_say` from brand_profile is applied here too.**
- **Don't schedule on operator-declared closed days.** Some shops close
  Mondays; check `brand_profile.locations[].hours`.
- **For multi-location clients, alternate** location_or_team slots
  evenly across the month. Two posts in a row from one location
  signals favoritism.

## Soft rules

- Aim for at least one post that names a specific person (owner, head
  cook, longtime teacher) per month — humanizes the brand.
- If `monthly_intake.photo_urls` is sparse (< 5 photos), drop to 8
  posts and flag to operator. We don't pad with stock.
- For tutoring centers: pivot the calendar to academic calendar
  events (midterms, finals, summer kickoff) — less festival-driven.
- For salons: heavy on festival lead-windows (mehendi pre-Karva-Chauth,
  bridal pre-Diwali) — these are revenue concentrators.

## What you do NOT do

- You don't write final captions — you produce stubs. Channel-owning
  agent finalizes.
- You don't pick the Reel — that's video-producer. You reserve the slot
  date.
- You don't run the schedule — that's the api/src/jobs/ cron that sends
  to Outstand.
