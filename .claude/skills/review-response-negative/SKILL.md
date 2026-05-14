---
name: review-response-negative
description: Draft a response to a negative (1-3 star) Google / Yelp / Facebook review. Used by reputation-manager. Goal is de-escalation, specific apology, single path to make it right — never argued in public, never compensation offered publicly. Always operator-confirmed before posting.
---

# Review response — negative (1-3 stars)

## What we are trying to do

1. Show the reviewer (and every future reader) that the business
   listens.
2. Acknowledge the specific issue.
3. Offer a private path to make it right (DM, call, ask for [name]).
4. Move the conversation off the public thread.

What we are NOT trying to do: win the argument. The audience of a
review response isn't the reviewer — it's the 200 people who read
the reviews while deciding whether to come in.

## Structure

1. **Acknowledge by name** + briefly name the issue. "Sai — I'm sorry
   you had to wait 40 minutes for the dosa on Saturday."
2. **Specific apology, not generic.** "I'm sorry the parippuvada was
   sold out" beats "I'm sorry you had a bad experience." If the
   operator gave context, weave it in factually ("we'd been frying
   every two hours and the Saturday crowd was bigger than usual").
3. **Concrete path to make it right.** "DM us / call us at (703)
   XXX-XXXX / ask for [name] next time." NEVER offer a free item or
   refund in public — invites gaming.
4. **One line of closing** if the brand uses owner sign-off.

## Length: 3-5 sentences. 50-110 words.

## Examples

### 2-star — long wait

> Sai — I'm sorry the wait was 40 minutes on Saturday. It was busier
> than usual and the kitchen got behind, no excuse. If you're willing,
> please call me directly at (703) XXX-XXXX or ask for Aditi when you
> come in — I'd like to make sure your next visit is faster. — Aditi

### 1-star — wrong order

> Raj — thank you for telling us this. Getting your order wrong is
> on us, not on you. Please DM or call (703) XXX-XXXX — I want to
> understand what happened and make sure it doesn't repeat. — Aditi

### 3-star — food was fine, ambiance complaint

> Priya — appreciate you taking the time. The dining room is small
> and noisier than I'd like — we're working on it. Try the back two
> tables next visit, they're the quietest. Thanks for coming in.
> — Aditi

### 2-star — felt unwelcome

> Anjali — I'm sorry you didn't feel welcome. That's on us, not on
> you. Please call (703) XXX-XXXX — I'd like to hear what happened
> directly so we can fix it. — Aditi

### 1-star — factually wrong (claims we serve meat at a veg place)

> Hi — I think there may be a mix-up. Aditi's Kitchen is a
> vegetarian South Indian restaurant in Ashburn; we don't serve
> meat at any location. If you'd like to share which place you
> visited, please DM us so we can sort it out. — Aditi

### 1-star — no text, just a star

> Skip the response. Flag to operator: "1-star no text — do not
> reply, possibly flag for platform review if pattern emerges."

## Hard rules

- **Never argue.** Don't contradict the reviewer's experience.
- **Never offer compensation publicly.** Refund / free meal / gift
  card stays off the public response. Move to DM.
- **Never admit specific liability** ("our food gave you food
  poisoning"). "I'm sorry you felt unwell after your visit" is OK
  if appropriate.
- **Never blame other customers** ("the loud family next to you").
- **Never blame staff publicly** ("our server was new"). The owner
  takes the L on behalf of the staff.
- **Never mention competitors** even if reviewer compares.
- **Never use the response to upsell** ("by the way, try our…").
- **First name only.** No last names.
- **Apply brand_profile.do_not_say.**
- **Reply within 48 hours.** Velocity matters but speed isn't worth
  shipping a defensive response. If the operator can't review same-day,
  draft it and queue.

## Soft rules

- If the operator gave specific factual context (e.g., "the kitchen
  was short-staffed that day"), include it factually, not as an
  excuse. Tone: "this is what happened" not "this is why we couldn't
  help it."
- For 3-star reviews, the response is short — they aren't angry, just
  mildly disappointed. Long apologies feel disproportionate.
- For 1-star drive-by reviews (no specifics, pure venom), a short
  measured reply protects the public read but don't engage in detail.
- Yelp specifically: shorter is better. Yelp's algorithm flags
  promotional / lengthy owner responses.
- Never close with "we hope to see you again" if the reviewer made
  clear they won't return. Sounds dismissive.

## Output

```json
{
  "draft": "Sai — I'm sorry the wait was 40 minutes on Saturday. ... — Aditi",
  "alternates": [ "...", "..." ],
  "tone_notes": "calm, specific, non-defensive, private-path offered",
  "operator_action": "review_and_post" | "review_and_request_takedown",
  "operator_notes": "Reviewer is third 1-star this month — consider asking happy regulars for reviews to dilute."
}
```

## What you do NOT do

- Do not auto-post.
- Do not respond multiple times to the same review thread.
- Do not engage with replies to your response in the public thread.
  All escalation moves to DM / phone.
