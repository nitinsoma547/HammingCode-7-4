# Local SEO Audit — Aditi's Spice Depot

_Onboarding audit, May 2026. Owned by the `gbp-and-local-seo` agent. This
shop has TWO physical locations — each needs its own Google Business
Profile. Everything below is duplicated per-location unless explicitly
shared._

---

## 1. NAP consistency (Name · Address · Phone)

**Authoritative source = `clients/aditis/spice-depot/site/content/brand.ts`**

### Ashburn

| Surface       | Name                       | Address                                     | Phone           |
|---------------|----------------------------|---------------------------------------------|-----------------|
| Website       | Aditi's Spice Depot        | 43880 Russell Branch Pkwy, Ashburn, VA 20147 | (703) 555-0142  |
| GBP (Ashburn) | _TODO — verify or claim_   | _TODO_                                       | _TODO_          |
| Facebook page | _TODO_                     | _TODO_                                       | _TODO_          |
| Instagram bio | _TODO_                     | _TODO_                                       | _TODO_          |
| Yelp          | _TODO_                     | _TODO_                                       | _TODO_          |

**Verdict:** UNKNOWN until operator confirms what's currently live. The
website is the only canonical surface today. **The phone number in
brand.ts is a placeholder (`(703) 555-0142`) — replace with the real one
before propagating anywhere external.**

### Herndon

| Surface       | Name                       | Address                                     | Phone           |
|---------------|----------------------------|---------------------------------------------|-----------------|
| Website       | Aditi's Spice Depot        | 2465 Centreville Rd, Herndon, VA 20171      | (703) 555-0287  |
| GBP (Herndon) | _TODO — verify or claim_   | _TODO_                                       | _TODO_          |
| Facebook page | _TODO_                     | _TODO_                                       | _TODO_          |
| Instagram bio | _TODO_                     | _TODO_                                       | _TODO_          |
| Yelp          | _TODO_                     | _TODO_                                       | _TODO_          |

**Verdict:** UNKNOWN. Same fix: confirm the real phone number and
propagate. Critically — **the two stores share one brand but must NOT
share a GBP listing.** Each has its own Place ID. If a single GBP is
listed for both, separate them before anything else.

### NAP rules to apply across both shops

- Pick "Pkwy" vs "Parkway" (and "Rd" vs "Road") and propagate the same
  spelling everywhere. Mismatches are the most common ranking penalty
  for multi-location SMBs.
- Use one phone format: `(703) 555-XXXX` (matches the website). Do not
  alternate with `703-555-XXXX` or `703.555.XXXX`.
- Hours are 7-days-a-week, 10 AM – 9 PM at both stores (per `brand.ts`).
  Verify these match the GBP listings exactly.

---

## 2. GBP completeness (per location)

Apply this checklist to BOTH listings (Ashburn + Herndon):

- [ ] Verified (postcard / phone)
- [ ] Primary category: **"Indian grocery store"** (preferred over
      "Spice store" because Google Loudoun search volume is higher on
      the grocery query)
- [ ] Secondary category: **"Spice store"** + **"Asian grocery store"**
- [ ] Hours match website (10 AM – 9 PM every day)
- [ ] ≥ 5 photos uploaded in the last 30 days, fresh per month going forward
- [ ] Q&A populated — see top 3 below
- [ ] Products tab populated — 10–15 hero SKUs (drives long-tail search)
- [ ] Reviews ≥ 20 and avg ≥ 4.2 — if not, remediation plan = ask happy
      in-person customers, never solicit fake reviews
- [ ] Posting cadence: 1 GBP post / week (see `campaigns/2026-05/gbp-posts.json`)
- [ ] Special hours set for Memorial Day weekend (open all three days)

**Top 3 Q&A entries to seed (both stores):**

1. *"Do you carry [MDH / Patak's / Aashirvaad / Bikaji]?"* — Answer:
   "Yes, full range. We also stock Maggi, MTR, Haldiram's, Bikaji."
2. *"Do you grind spices in-store?"* — Answer: "Yes. Sambar masala is
   ground fresh every Tuesday at the back of the shop. Garam masala and
   rasam powder ground on request."
3. *"Is parking available?"* — Answer: Ashburn lot at Russell Branch
   Center / Herndon lot at 2465 Centreville Rd (specifics per operator).

---

## 3. On-page schema (current state of the marketing site)

**Site:** `clients/aditis/spice-depot/site/`

**FLAG:** The site does **not yet have JSON-LD structured data**. This is
the single highest-impact fix for local SEO. Hand-off to
`website-developer` agent — see Section 7 below.

What's needed (one block per location, both rendered on the homepage):

```json
{
  "@context": "https://schema.org",
  "@type": "GroceryStore",
  "@id": "https://aditisspicedepot.com/#ashburn",
  "name": "Aditi's Spice Depot — Ashburn",
  "image": "https://aditisspicedepot.com/og/ashburn.jpg",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "43880 Russell Branch Pkwy",
    "addressLocality": "Ashburn",
    "addressRegion": "VA",
    "postalCode": "20147",
    "addressCountry": "US"
  },
  "telephone": "+1-703-555-0142",
  "openingHoursSpecification": [{
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
    "opens": "10:00",
    "closes": "21:00"
  }],
  "priceRange": "$$",
  "sameAs": [
    "https://facebook.com/<TODO>",
    "https://instagram.com/<TODO>",
    "<GBP Ashburn URL TODO>"
  ]
}
```

Duplicate for Herndon (`@id: #herndon`, address + phone updated).

Plus a `BreadcrumbList` and an `ItemList` of the three featured products
(Idukki cardamom, sambar masala, basmati 1121) — schema-as-shelf for
long-tail product queries.

---

## 4. Local keyword gaps (Loudoun)

Target keywords ranked by likely conversion intent + current volume:

| Keyword                                | Volume (est.) | Our rank | Action                                                     |
|----------------------------------------|---------------|----------|------------------------------------------------------------|
| "indian grocery ashburn"               | high          | UNKNOWN  | Anchor of Ashburn GBP + homepage `<title>`                 |
| "indian grocery herndon"               | high          | UNKNOWN  | Anchor of Herndon GBP + a dedicated /herndon page if missing |
| "spice shop ashburn" / "spice store ashburn" | medium  | UNKNOWN  | GBP secondary category + page H1 includes "spice"          |
| "indian groceries near me"             | very high     | UNKNOWN  | Driven by NAP consistency + review velocity, not keywords  |
| "biryani spices loudoun"               | low-medium    | UNKNOWN  | Product page for Basmati 1121 + garam masala bundle        |
| "fresh ground sambar masala"           | low (high intent) | UNKNOWN | Tuesday-grinding GBP + IG pillar — moat content              |
| "south asian grocery loudoun"          | medium        | UNKNOWN  | Pan-South-Asian framing in homepage meta description       |
| "patel brothers alternative loudoun"   | low (very high intent) | n/a | Don't target by name — that's a citation trap. Lean on "fresh-ground in-store" as the differentiator |
| "indian wedding spices ashburn"        | low (seasonal) | UNKNOWN | Wedding-season GBP + gift-basket landing page              |
| "halal indian grocery loudoun"         | medium        | UNKNOWN  | If we carry halal-certified product, surface it on the site |

**Method:** manual incognito Google search from a Loudoun (20147 / 20171)
IP each month, log positions in `campaigns/<month>/rank-check.csv`.

---

## 5. Citations (top 5 directories to claim — per location)

1. **Google Business Profile** — Ashburn + Herndon, both claimed and verified.
2. **Yelp** — both locations. Owner-verified, NAP exact-match, hours synced.
3. **Bing Places** — both locations. Often overlooked; ~7% of search share.
4. **Apple Maps Connect** — both locations. iPhone users default here.
5. **Sulekha** (Indian-American local directory) — both locations.
   High signal for South Asian diaspora searches in Northern Virginia.

**Skip:** spammy directory networks ("local-citation-blasting" services).
These are penalty traps per `gbp-and-local-seo.md` hard rules.

**Worth considering after the top 5 are clean:**

- Desi Yellow Pages (NoVA edition)
- Loudoun County Chamber of Commerce business directory
- TripAdvisor (lower priority for grocery vs. restaurants, but a brand
  signal)

---

## 6. Mobile / page-speed snapshot

Run after the next site deploy:

- [ ] Lighthouse mobile score ≥ 90 (Performance, Accessibility, Best Practices, SEO)
- [ ] Largest Contentful Paint ≤ 2.5s on 4G
- [ ] Tap targets ≥ 48px (especially the call buttons for both locations)
- [ ] `<title>` ≤ 60 chars, includes "Aditi's Spice Depot" + "Loudoun"
- [ ] Meta description ≤ 155 chars, includes both city names
- [ ] OG image present (1200×630) and uses the brand offwhite + saffron palette
- [ ] Each location has its own `/ashburn` and `/herndon` URL with unique H1
      (mirrors the GBP separation)

---

## 7. Recommended actions (ranked by impact)

1. **Verify or claim BOTH Google Business Profiles.** This is the single
   biggest lever. Without two verified GBPs, nothing else matters for
   local rank.
2. **Confirm and propagate real phone numbers** for both stores. Replace
   the `(703) 555-0142` / `(703) 555-0287` placeholders in
   `clients/aditis/spice-depot/site/content/brand.ts` and re-run any
   asset render that pulls from it.
3. **Add JSON-LD `GroceryStore` schema** for both locations to the site
   homepage. Hand-off to `website-developer` agent. See Section 3 above.
4. **Lock NAP consistency** across website + GBPs + FB + IG + Yelp +
   Bing + Apple Maps + Sulekha. Use the website as the canonical source.
5. **Populate both GBP Products tabs** with the 10–15 hero SKUs from
   `brand.ts.catalog` (cardamom, sambar masala, basmati 1121, MDH range,
   Haldiram's range, dals, atta).
6. **Set up the May GBP post pack** from
   `campaigns/2026-05/gbp-posts.json` — publishes to BOTH listings.
7. **Set up a monthly rank-check** for the 10 keywords above; log to
   `campaigns/<month>/rank-check.csv`.
8. **Build a /herndon page** if the site currently only has one
   location-anchored page. Each location should have its own URL, H1,
   meta description, and schema block — that's what lets Google rank
   them independently in their respective neighborhoods.
9. **Reviews flywheel:** ask 5 happy in-person customers per shop per
   month to leave a Google review. Print a small (3x4") counter card
   with the GBP QR code. Never solicit a star rating; just "if you have
   30 seconds."
10. **Add `LocalBusiness` `hasOfferCatalog`** with the three featured
    products as `Offer`s, priced. Drives product-query long-tail.

---

## Notes

- Two physical locations means two separate flywheels — Google ranks
  each shop in its own neighborhood pack. Don't try to unify them under
  one GBP listing; that's a downgrade.
- The "fresh-ground in-store every Tuesday" angle is the strongest local
  differentiator against Patel Brothers / House of Spice and should be
  the headline of both shops' GBP descriptions.
- Languages on the GBP listing: English primary; the listing's
  description can mention "we serve customers in Hindi, Tamil, Telugu,
  Malayalam, and Punjabi" because that's a real signal — but the listing
  text itself stays English (Google's display logic doesn't render
  Devanagari well in the map pack).
