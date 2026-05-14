---
name: whatsapp-broadcast-copy
description: Write the monthly WhatsApp broadcast message the operator forwards to the client to copy-paste into their broadcast list. WhatsApp is semi-manual by design — the client does the 30-second paste themselves. This skill produces a message that's plain-text, copy-paste safe, and reads as the OWNER speaking (not a marketing agency).
---

# WhatsApp broadcast copy

## Channel reality

- WhatsApp Business broadcast lists are how Loudoun desi SMB owners
  actually keep customers warm. SMS read rates are ~98% — that's not
  hype, that's the channel.
- The owner pastes the message to their own broadcast list themselves.
  We don't have API access to their customer phone numbers; we never
  will in v1.
- The message must feel like the OWNER wrote it — not an agency.
  First-person, conversational, no marketing-ese.

## Format rules

- **Plain text. No markdown.** WhatsApp renders `*bold*` and `_italic_`
  but newer Android clients sometimes show the literal asterisks. Skip
  them.
- **Max 7 lines.** Read on a phone in 5 seconds.
- **Max 1,000 characters total.** Practical cap; longer = scrolling.
- **No emoji on lines that contain a price or phone number.** Looks
  like spam.
- **One CTA.** Either a phone number (tap-to-call works) or a link.
  Not both.
- **Sign with the owner's first name** if `brand_profile` says they
  use first-name sign-off. "— Aditi" or "— Ravi anna" or no signature.
- **Start with greeting + name.** "Namaste friends," "Hi all," "Hello
  Aditi family" — pick from brand_profile.voice_examples.

## Structure template

```
[Greeting line — single line]

[News in one sentence — the festival / promo / new dish.]

[Detail — date or hour, 1-2 short lines.]

[CTA — single line, phone or short link.]

[Sign-off — owner first name, no role.]
```

## Examples

### Festival (Vishu)

```
Namaste friends,

This Sunday — April 14 — we're doing a full Vishu sadya at the Ashburn
shop.

20 items on the banana leaf, payasam included, $24/plate. Two seatings:
12pm and 2pm.

To reserve: (703) XXX-XXXX

— Aditi
```

### New menu item

```
Hi all,

The Mysore masala dosa is back on the regular menu starting tomorrow.

16-hour fermented batter, fresh ground masala, served with two
chutneys + sambar.

Tue–Sun, lunch and dinner.

— Aditi
```

### Spice sale

```
Hello friends,

Spring sale starts Saturday at both shops — 10% off all whole spices.

Stock up before Diwali season — green cardamom, black cardamom,
dried bay, ghatti masala.

Ashburn: (703) XXX-XXXX
Herndon: (703) YYY-YYYY

— Aditi
```

## Do NOT

- Do not write "Click here." On WhatsApp, the link IS the click target.
- Do not write "Forward to your friends!" — feels chain-letter.
- Do not include unsubscribe language. We're not a marketing platform;
  it's the owner's personal broadcast.
- Do not write "Dear valued customer." That's email-speak.
- Do not include hashtags. Not a WhatsApp norm.
- Do not include long URLs. Use a short or branded link if needed.
- Do not include images embedded in the text — image goes as a
  separate attachment, the operator sends image first then this
  message.
