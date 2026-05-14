---
name: local-seo-audit
description: Run the onboarding local-SEO audit for a new client. Used by gbp-and-local-seo. Produces a checklist of fixes ranked by impact, focused on Google Business Profile, NAP consistency, on-page schema, and the top 5 directories that matter for South Asian SMBs in Loudoun.
---

# Local SEO audit (onboarding)

Run once per client at onboarding. Produces a markdown report saved to
`clients/<slug>/seo-audit.md`. The report becomes the punch-list of
fixes the operator works through in the first month.

## What you check

### 1. Name / Address / Phone (NAP) consistency

Pull each version of the business identity from:
- Google Business Profile (the address Google has)
- Website (the address on the contact page + footer)
- Facebook page (the address in "About")
- Instagram bio
- Yelp (if claimed)
- Top 3 directory listings that surface in a Google search for the
  business name

Compare. Flag every mismatch — even "Ste 100" vs "Suite 100" vs "#100"
matters for citation parsing.

### 2. GBP completeness

For each `brand_profile.locations[]` entry, audit the matching GBP:

- [ ] Verified ownership
- [ ] Primary category is correct (and the most specific available —
      "South Indian Restaurant" beats "Indian Restaurant" beats
      "Restaurant")
- [ ] Secondary categories used (up to 9 slots; useful for cross-cuisine
      or service-add)
- [ ] Hours match the website AND `brand_profile.locations[].hours`
- [ ] Holiday / festival hours set if applicable (Diwali day, Onam day)
- [ ] At least 5 photos uploaded in the last 30 days, with at least one
      from each tab: Logo, Cover, Interior, Food/Product, Team
- [ ] Q&A: top 3 expected questions seeded by the owner (not customers)
- [ ] Service / menu / product list populated
- [ ] Reviews ≥ 20, average ≥ 4.2 (or a documented plan to remediate)
- [ ] Attributes set (vegetarian, wheelchair-accessible, takeout, etc.)
- [ ] Booking / reservation link if the client uses Toast / OpenTable

### 3. On-page schema markup

Audit the client's existing website (if any):

- LocalBusiness or Restaurant or FoodEstablishment schema present?
- OpeningHoursSpecification correct?
- Address as PostalAddress, not free-text?
- Telephone as international format?
- For multi-location, are both locations marked up with distinct
  `@id` and lat/long?
- `sameAs` pointing to FB / IG / Yelp / GBP?
- Menu schema on the menu page (for restaurants)?
- Product schema on product pages (for spice/grocery shops)?

If no website exists yet, schema goes into the website-developer's
spec for the new site.

### 4. Local keyword gaps

Run incognito Google searches from a Loudoun zip code (20147 / 20148 /
20170 / 20176) for:

- `<cuisine/category> near me`
- `<cuisine/category> <neighborhood>` (Ashburn, Herndon, Sterling,
  Leesburg, One Loudoun)
- `<specific dish/product> near me` (e.g., "dosa near me",
  "biryani near me", "Indian groceries Ashburn")
- `<festival prep> near me` (e.g., "Diwali sweets near me" — seasonal)

For each: record competitor in the top 3 of map pack, our current
position (or "not on first page"), and the action that closes the gap.

### 5. Citations (top 5 directories for desi SMB in Loudoun)

In rough order of return for our audience:

1. Yelp (if not already claimed)
2. TripAdvisor (restaurants only)
3. Zomato (high desi-community trust)
4. Sulekha (Indian-American community directory)
5. DesiYellowPages (low SEO weight but community-trusted)

Restaurants additionally: Toast / OpenTable / Resy if the client uses
them — those listings are SEO+commercial.

### 6. Mobile experience

- Is the website mobile-responsive?
- Does tap-to-call work on the phone number?
- Are hours readable without zooming?
- Lighthouse Performance (mobile) ≥ 90?

## Output format

```markdown
# Local SEO Audit — <Client Name>
_Run by: <agent / operator> · Date: <YYYY-MM-DD>_

## 1. NAP Consistency
| Source       | Name              | Address                    | Phone         |
|--------------|-------------------|----------------------------|---------------|
| GBP          | Aditi's Kitchen   | 12345 Loudoun Rd, Ashburn  | (703) ...     |
| Website      | Aditi's Kitchen   | 12345 Loudoun Road, Ashburn | (703) ...    |
| Facebook     | Aditi's Kitchen Ashburn | ...                  | ...           |
| Instagram    | Aditi's Kitchen   | (no address in bio)        | (no phone)    |

Mismatches:
- "Loudoun Rd" vs "Loudoun Road" — pick one and propagate.
- IG bio missing phone.

## 2. GBP Completeness
- [x] Verified
- [ ] Hours mismatch with website (website says Mon closed, GBP says
      Mon 11-9)
- [ ] Last photo upload: 47 days ago — refresh needed.
- [ ] Q&A empty — seed top 3.
- ...

## 3. Schema Markup
- LocalBusiness: missing
- OpeningHoursSpecification: missing
- Menu schema: missing
- Action: hand off to website-developer for full schema implementation.

## 4. Keyword Gaps
| Keyword                     | Top 3 (map pack)    | Our rank        | Action                  |
|-----------------------------|---------------------|-----------------|-------------------------|
| dosa near me (20147)        | A, B, C             | not on first    | improve photos + Q&A    |
| south indian ashburn        | A, our, B           | #2 map pack     | hold cadence            |
| ...                         | ...                 | ...             | ...                     |

## 5. Citations
- [ ] Yelp — not claimed. Claim required.
- [ ] Zomato — not listed. Add.
- [ ] Sulekha — listed but stale. Update.
- ...

## 6. Mobile
- [x] Mobile-responsive
- [ ] Lighthouse Performance: 72/100 — needs image compression.

## Punch List (ranked)
1. **NAP cleanup** (1 hour) — propagate "Loudoun Rd" everywhere.
2. **GBP photo refresh** (30 min) — upload 5 photos from intake.
3. **Add schema markup to website** (handoff to website-developer).
4. **Claim Yelp + Zomato** (45 min).
5. **Seed top 3 Q&A on GBP** (15 min).
6. **Fix hours mismatch** (5 min).
7. **Compress hero image** (handoff to website-developer).
```

## Hard rules

- Never recommend buying backlinks, submitting to PBN-style networks,
  or paying for review services. These are penalty traps.
- Never recommend fake reviews. Ever.
- Real keyword research uses real searches from real Loudoun zips, not
  generic SEO-tool extracts.
- Schema must match visible page content. Don't pad JSON-LD with menu
  items not on the menu page.

## Cadence

- Initial audit at onboarding.
- Refresh quarterly (every 3 months) — re-run keyword positions, NAP
  drift check, citation health.
- Don't run monthly; SEO moves slowly and monthly noise creates
  busy-work, not progress.
