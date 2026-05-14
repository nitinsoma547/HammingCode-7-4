---
name: review-response-positive
description: Draft a response to a positive (4-5 star) Google / Yelp / Facebook review. Used by reputation-manager. The goal is to thank specifically, add one personality detail, and invite return — all in 2-3 sentences, never auto-published.
---

# Review response — positive (4-5 stars)

## Structure

1. **Thank by first name.** "Priya — thank you." Not "Dear valued customer."
2. **Name the specific thing they praised** + add one detail or piece
   of personality. ("The dosa batter rests 16 hours before we hit the
   tava — glad you tasted that.")
3. **Single invite to return.** Mention an item they haven't tried, if
   you can infer one from their review. Skip this if they're clearly
   a repeat customer.
4. **Optional sign-off.** "— Aditi" if `brand_profile` uses first-name
   owner sign-off. Skip if the brand uses "Team [Name]."

## Length: 2-3 sentences max. 30-80 words.

## Examples

### 5-star — new customer praising dosa

> Priya — thank you. The Mysore masala batter rests 16 hours and the
> ghee is from Idukki. Try the ghee roast next visit, my favorite on
> the menu. — Aditi

### 5-star — repeat customer

> Means a lot, Raj. See you next Sunday. — Aditi

### 4-star — praising service but small complaint

> Sai — thanks for the kind words. We're working on the wait at 7pm
> (it's our busiest hour and the kitchen needs to catch up). Try the
> 5pm seating next time. — Aditi

### 5-star — spice shop, praising specific brand

> Lakshmi — thank you. That MTR sambar powder is from the original
> Bangalore line, not the export version — most people don't notice.
> If you cook payasam, our Idukki cardamom is the same supplier. — Aditi

### 5-star — tutoring center, praising a teacher

> Anjali — thank you. Saira-ma'am is the calmest person in the
> building during finals week — glad it helped. See you at the summer
> kickoff in June. — Aditi

## Hard rules

- **First name only.** Never use last names from the review.
- **Don't repeat their words back verbatim** — sounds like a chatbot.
  Reference the thing, don't quote it.
- **No "your feedback means the world to us"** filler.
- **No CTAs to other channels** ("follow us on IG!"). Reviews aren't
  social funnels.
- **No upsells** ("by the way, we cater!"). Stay in lane.
- **No emoji** unless `brand_profile.tone_keywords` explicitly includes
  "playful" — default is no.
- **Apply brand_profile.do_not_say**.

## Soft rules

- Vary opening across responses. Mix "Priya — thank you," "Means a
  lot, Raj," "Glad you came back, Sai," "Lakshmi — thank you for
  this." Don't ship 5 reviews starting "Thank you so much."
- If the review mentions a date (e.g., "we came on Saturday"), the
  detail you add can reference that day specifically ("Saturday lunch
  is our busiest service — the dosa station was on fire that day").
- For 5-star reviews with photos, briefly acknowledge the photo ("the
  ghee shine in your photo is exactly how we want it to look"). Small,
  earned.
- For repeat customers, the response is shorter — one-liner is fine.
- If the review is in a language other than English AND
  brand_profile.languages allows, reply in both English + the
  language. Default is English only.

## Output (caller pastes draft for operator review)

```json
{
  "draft": "Priya — thank you. The Mysore masala batter rests 16 hours and the ghee is from Idukki. Try the ghee roast next visit. — Aditi",
  "alternates": [
    "Priya, glad you found us. ...",
    "..."
  ],
  "tone_notes": "warm, specific, owner-signed",
  "operator_action": "review_and_post"
}
```
