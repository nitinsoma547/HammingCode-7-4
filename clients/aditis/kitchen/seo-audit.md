# Local SEO Audit — Aditi's Kitchen

_Run by `gbp-and-local-seo` agent. Applies the `local-seo-audit` skill.
South Indian (Kerala-leaning) vegetarian restaurant, single Ashburn
location, 43880 Russell Branch Pkwy._

## NAP Consistency

The current state — to be confirmed by operator on a Loudoun-zip
incognito check before Saturday:

- **Brand site** (clients/aditis/kitchen/site/): `Aditi's Kitchen ·
  (703) 555-0142 · 43880 Russell Branch Pkwy, Ashburn, VA 20147`
- **GBP**: assumed claimed (Ravi's note). Photos are stale per the
  brief.
- **Facebook**: no handle in `brand.ts` — TODO operator.
- **Instagram**: no handle in `brand.ts` — TODO operator.
- **Yelp / Zomato / TripAdvisor**: unknown; check below.

**Verdict:** Cannot fully verify until operator confirms the live
phone + address + GBP listing. Phone is a placeholder string in
`brand.ts` — fix this FIRST. Any external citation referencing the
old phone tanks the audit.

**Action 1 (operator):** confirm real phone + address with owner,
update `clients/aditis/kitchen/site/content/brand.ts`, then propagate
to GBP, FB, IG, and any directory we've claimed.

## GBP Completeness Checklist

Inspect each, operator verifies in business.google.com:

- [ ] Verified (assumed yes, confirm)
- [ ] Category set to **"South Indian Restaurant"** (primary) +
      **"Vegetarian Restaurant"** (secondary). If currently set to
      generic "Indian Restaurant" — change. Kerala-leaning is a
      long-tail concentrator.
- [ ] Hours match website: **Tue–Sun 11AM–9PM, closed Monday.**
      Mismatches tank trust.
- [ ] Attributes set: `vegetarian`, `vegan options`, `Indian`,
      `dine-in`, `takeout`, `accepts reservations` (only if true).
- [ ] At least 5 photos uploaded **in last 30 days** — operator note
      says photos are stale. Hard remediation: get 5 fresh shots up
      before the Akshaya Tritiya post fires May 13.
- [ ] Q&A populated with top 3 expected questions (see below).
- [ ] Menu / product list present with at least signature 6 items.
- [ ] Reviews ≥ 20 and avg ≥ 4.2. If below: in-person ask-for-
      reviews campaign at checkout — no review buying, no review
      gating.

**Top 3 Q&A entries to seed:**

1. **"Do you take reservations?"** — answer: "We take reservations
   for sadya days only (Onam, Vishu, Akshaya Tritiya, Diwali). The
   rest is walk-in. Tue–Sun 11am–9pm."
2. **"Do you have vegan options?"** — answer: "Yes — the kitchen is
   100% vegetarian. Many dishes are naturally vegan (avial without
   curd, sambar, lemon rice, tender coconut). Ask the kitchen if
   you're unsure about ghee on a specific dish."
3. **"Is parking available?"** — answer: "Yes, free lot parking at
   Russell Branch shopping plaza."

## On-page schema (current state)

The Next.js site at `clients/aditis/kitchen/site/` does **NOT** yet
emit JSON-LD `Restaurant` schema. This is a website-developer task.

**Action 2 (website-developer):** add a `<script
type="application/ld+json">` block to the site root layout with:

```json
{
  "@context": "https://schema.org",
  "@type": "Restaurant",
  "name": "Aditi's Kitchen",
  "servesCuisine": ["South Indian", "Kerala", "Vegetarian"],
  "priceRange": "$$",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "43880 Russell Branch Pkwy",
    "addressLocality": "Ashburn",
    "addressRegion": "VA",
    "postalCode": "20147",
    "addressCountry": "US"
  },
  "telephone": "+1-703-555-0142",
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      "opens": "11:00",
      "closes": "21:00"
    }
  ],
  "hasMenu": "https://aditiskitchen.com/menu",
  "sameAs": []
}
```

Notes:
- Phone in the schema must match the visible page exactly — if
  brand.ts placeholder is replaced, replace here too.
- Don't list menu items in JSON-LD that aren't on the visible menu
  page. Google penalizes schema-content mismatches.
- Add `sameAs` URLs once FB + IG handles exist.

**Action 3 (website-developer):** ensure the `<title>` and
`<meta name="description">` on the home page include
`Ashburn`, `South Indian`, `dosa` — keyword bridge for local search.

## Local Keyword Gaps

Five keywords to track via manual incognito search from a 20147 zip:

| Keyword                       | Current rank (TODO check) | Action                                                     |
|-------------------------------|---------------------------|------------------------------------------------------------|
| "south indian ashburn"        | TODO operator             | Should land top 3 with schema + GBP photos refreshed       |
| "dosa near me" (20147)        | TODO operator             | Hardest one — competing with 4-5 other Indian places       |
| "Kerala restaurant Loudoun"   | TODO operator             | Long-tail concentrator; should land #1 (no real competitor)|
| "sadya near me"               | TODO operator             | Akshaya Tritiya post + future Onam push will reinforce     |
| "filter coffee ashburn"       | TODO operator             | Specific, low-volume, very high-intent                     |

The "Kerala restaurant Loudoun" search is the moat — there isn't
another Kerala-specific spot in Loudoun. Make this the on-page
priority over the broader "south indian" framing.

## Citations — top 5 directories to claim

Ranked by impact for South Asian SMB in Loudoun:

1. **Yelp** — table stakes. Claim, write the about section, upload
   5+ fresh photos.
2. **Zomato** — Indian diaspora actively uses this. NAP + menu.
3. **Sulekha** — the Indian-American directory. High intent,
   community-trusted. Claim + write a 2-3 sentence about.
4. **TripAdvisor** — lower priority for this audience but
   Loudoun-visitor searches land here; cheap to claim.
5. **Desi Yellow Pages / IndianEagle / NRI directories** — pick one
   that's active in NoVA. Low-effort claim, modest long-tail.

Skip: spammy directory blasters, paid citation networks. Penalty risk.

## Mobile Check

- [ ] Run Lighthouse mobile audit on the live site. Target ≥ 90
      Performance, ≥ 95 Accessibility.
- [ ] Confirm `tel:` links work — tapping the phone should dial.
- [ ] Confirm the Google Maps link in the footer opens in the
      Maps app on iOS + Android.

## Ranked Punch List

Ordered by impact-per-hour. Operator + website-developer split:

1. **Fix the placeholder phone number in `brand.ts`** (operator, 5
   min). Cascades to flyer, social, email, GBP, WhatsApp. Highest
   impact.
2. **Upload 5+ fresh photos to GBP** (operator, 20 min). Required
   before the Akshaya Tritiya post pack fires May 13.
3. **Add JSON-LD `Restaurant` schema to the site** (website-developer,
   30 min). Unlocks rich-results eligibility.
4. **Confirm GBP category = "South Indian Restaurant"** (operator,
   2 min). Long-tail unlock.
5. **Seed the top 3 Q&A entries in GBP** (operator, 10 min).
6. **Claim + populate Yelp, Zomato, Sulekha** (operator, 45 min
   total). NAP-consistent across all three.
7. **Confirm Tue–Sun hours on GBP match website** (operator, 2 min).
8. **Add `sameAs` to schema** once FB + IG handles exist
   (website-developer, 5 min).
9. **Run manual rank check from a 20147 incognito** on the 5
   keywords above (operator, 10 min). Sets the baseline.
10. **In-person at-checkout review ask** for any customer who
    sat down and ate (operator, ongoing). Move avg rating up and
    review count past 20.

No backlink buys. No citation-blasters. No keyword stuffing in
meta tags. The path is consistency + completeness, not gimmicks.
