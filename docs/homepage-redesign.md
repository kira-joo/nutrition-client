# Homepage visual redesign — reference and rationale

**Status: implemented on the homepage only, awaiting approval before
extending to the rest of the site.** Screenshots in
`docs/redesign-reference/` are the actual rendered output, captured
2026-08-22 — not a mockup. This file exists specifically so this direction
survives independently of any chat session: the previous "Option A" HTML
exploration was approved verbally in an earlier session but never saved
anywhere, and was unrecoverable when asked for again. Everything that
matters about this pass is written down here or in the code comments next
to what it describes.

## Second pass (2026-08-22, same day): hero, logo, Packages, Reviews

After the first pass above, review of the actual rendered result found
three more real gaps, fixed in order:

- **Mobile hero read as a floating sticker.** The bounded artwork panel
  used a symmetric inset (even padding on every side of the portrait),
  which centred her inside a card instead of anchoring her to a scene.
  Fixed twice, in the right direction the second time: first the panel
  was cut short at 80% height for an "overlap" effect, which instead read
  as the background ending too early beneath her; the panel now runs the
  full height of the portrait box with only the *top* pulled in tight, and
  the portrait itself uses `object-bottom`. She's now visibly larger,
  anchored to the panel's base, with no empty margin around her.
- **Desktop hero was too wide and too tall**, and the header logo was
  illegible. `Container` dropped from `wide` to `content`, vertical
  padding roughly halved, the portrait column narrowed (`max-w-lg` →
  `max-w-md`), and the header's desktop/tablet logo grew from `h-12` to
  `h-16` (the row itself is `h-20` at that breakpoint, so the old size was
  leaving 32px of unused headroom for no reason) — the compact mark from
  the first pass stays mobile-only.
- **Packages and Reviews were the two surfaces that actually needed to be
  excellent**, per explicit direction to stop refining and either commit
  fully or rebuild:
  - `PricingCard`: the leaf watermark and leaf-icon price divider are
    gone — a botanical accent inside a pricing card fought the "minimal
    medical luxury" brief instead of serving it. A new restrained gold
    accent (`--color-gold` / `-on-dark` / `-soft`, computed against real
    backgrounds, never used as body text) replaces it as a hairline rule
    and the recommended card's border. Original/current price is stacked
    (struck-through line above, large bold price below) instead of
    inlined, for real hierarchy. The recommended tier's CTA is a white
    button — it was `primary`-on-`primary` before and disappeared into
    the card's own fill.
  - **Reviews: rebuilt from zero**, not refined. The static grid is gone;
    `ReviewsPreviewSection` now renders `TestimonialCarousel` — a second
    consumer of the existing, already-tested `useCarouselAutoplay` hook
    (18 tests: hover/focus-within pause, WCAG 2.2.2 pause button, terminal
    restart state, dwell reset, live reduced-motion) — with a card built
    specifically for it, `TestimonialCard`, instead of the shared
    `ReviewCard`. That's deliberate: every real review record has both a
    quote and a screenshot image, and showing the screenshots side by side
    in a carousel is exactly the "screenshots dropped into a grid" effect
    this rebuild exists to remove — so the new card shows the real quote
    text as a designed testimonial and links out to `sourceUrl` for the
    original post, never the raw image. Featured reviews get a genuinely
    different object (deep `primary` fill, gold stars and quote mark,
    larger type, `lg:-translate-y-3` raise, `shadow-package`) at the same
    width as standard cards, so the row's alignment stays clean while the
    hierarchy is immediately visible without a badge.

**A real content gap surfaced, not fixed:** every review's English
`content` field is empty or a literal `"."` — verified against all 7 live
records, not assumed. The `/en` carousel is structurally correct (no
overflow, correct mirroring, autoplay/controls all work) but has
essentially nothing to show as English testimonial text. This needs real
English review content in the CMS; inventing placeholder translations
would violate the standing "don't fabricate business content" rule, so it
wasn't done here.

## Third pass (2026-08-22, same day): the review rail, rebuilt again

The second pass's `TestimonialCarousel` was a discrete, Embla-driven,
container-constrained carousel that happened to drop the real review
photos in favour of quote-only cards. That missed three things at once,
corrected here:

- **The screenshots came back.** Every real review has both a quote and a
  photo (usually a WhatsApp or Facebook screenshot); showing only the
  quote was an overcorrection against "screenshots in a grid" that also
  removed real, requested social proof. `TestimonialCard` now shows both —
  the image cropped to a fixed ratio (`aspect-[4/3]` featured, `[16/10]`
  standard, `object-cover object-top`) so wildly different source shapes
  (real data ranges from 602×1452 to 1080×2740) don't produce
  different-height cards, and the quote below it.
- **It's a continuous rail, not a discrete carousel.** `TestimonialRail`
  replaces Embla with a hand-rolled Motion loop: the (interleaved) list
  renders twice back to back, and `animate()` moves the track's `x` from
  `"0%"` to `∓"50%"` (sign follows `isRtl`) on an infinite `ease: "linear"`
  repeat — exactly one copy-width per lap, so the reset from -50% back to
  0% is invisible. Verified in a real browser, not just by reading the
  code: sampled the track's computed `transform` matrix three times a
  second apart and confirmed a constant ~68px/s delta, watched two
  screenshots three seconds apart show genuinely different cards, and
  confirmed hover/manual-pause both freeze the exact same matrix value
  and releasing either resumes it.
- **It's full-bleed.** The rail is `Container`'s sibling, not its child,
  so it spans edge to edge the same way `CampaignBannerSection`'s bar
  does; only the heading above it stays aligned to the content grid.
- **Featured cards no longer cluster.** The previous "sort featured
  first" put 3-4 deep-`primary` cards in a row before any white one —
  with real data at 4 featured vs 2 standard, sorting is exactly wrong.
  `interleaveByFeatured` spreads the minority variant evenly through the
  majority instead, so the rail alternates rather than blocking.
- **Reduced motion removes the loop, not just its speed.** Verified via
  `page.emulateMedia({ reducedMotion: 'reduce' })`: the track renders one
  copy (not two), no `transform`, the pause button doesn't render (nothing
  to pause), and the wrapper becomes horizontally scrollable — checked
  those four facts directly against the DOM, not inferred from the code.

`docs/motion-system.md` gained a short section explaining why this is
*not* layer 2 (Ambient) despite being a continuous loop — layer 2 is
explicitly barred from carrying information or being consciously
trackable, and this rail is built to do both.

## Why this pass happened

A visual audit (real browser, both locales, both breakpoints, not just a
read of the source) found that only the hero and footer had actually been
redesigned. Everything between them was the old structural skeleton —
bare numbered lists, literal `✅` emoji as bullets, generic flat white
cards — wearing the new palette and fonts. This pass is the fix: the
homepage section by section, using the surviving master brief
(`/Users/joe/.claude/plans/nutrition-client-purring-toucan.md` §5–12) as
the structural foundation, pushed further where the brief's own
"design-quality gate" calls for it explicitly (§7: *"never one
rounded-rectangle-plus-shadow reused for every content type"*).

## What's in `docs/redesign-reference/`

| File | What it shows |
|---|---|
| `homepage-desktop-1440-ar.png` | Full homepage, 1440px, `/ar` (RTL) |
| `homepage-desktop-1440-en.png` | Same page, `/en` (LTR) — proves the card shape, timeline and asymmetric layouts mirror correctly rather than just flipping text direction |
| `homepage-mobile-375-ar.png` | Full homepage, 375px, `/ar` — the mobile composition is designed per-section, not a compressed desktop layout |

These are full-page captures of the real implementation. If this direction
is approved and later changes drift from it, re-generate fresh screenshots
the same way rather than trusting these to stay pixel-accurate forever —
but the *decisions* below don't expire.

## The design plan

**Palette and type were not reopened.** The existing tokens
(`src/app/globals.css`) — deep forest green `primary` (`#146356`), warm
terracotta `accent` (`#B24B28`), warm cream `background` (`#FBF9F4`),
single bilingual Cairo family — were already a real, distinctive choice,
not the generic AI-default palette. Cairo pairing with a second display
face was considered and deliberately rejected: `docs/design-system.md`
already documents a reasoned decision against pairing (a mismatched
second typeface risks looking like two unrelated brands stitched
together, which is a common way this kind of redesign goes wrong). Cairo
900 (added this pass) supplies the extra display weight instead.

**The signature: a notched card corner.** Every redesigned card
(`.surface-notched` in `globals.css`, `SURFACE_NOTCHED` in
`surface.ts`) keeps three corners at the generous `28px` radius and clips
the fourth to `6px` — a folded-leaf silhouette rather than a uniform
rounded rectangle, built from CSS logical properties
(`border-end-end-radius`) so it sits at the same reading corner in both
directions without an `rtl:` override. This is the one deliberate
aesthetic risk this pass takes, per the brief's own instruction to spend
restraint everywhere else once a real signature exists.

**Card language, three genuinely different families** — not one card
style repeated with different content, which is exactly the failure mode
the audit found:

1. **Numbered card grid** (`TrustBandSection`, "why choose me") — the
   notched shape with an oversized, mostly-off-canvas serial numeral as a
   watermark rather than a small inline glyph.
2. **Connecting timeline** (`ProgramHighlightsSection`, "what you get") —
   a literal line running through numbered nodes, horizontal on desktop
   and vertical on mobile. This is the one place the "Botanical Trust"
   identity shows up as structure rather than colour: the line is the
   stem, each highlight is a node on it. (The CMS-authored `✅ ` prefix on
   this content is stripped presentationally — verified it's an exact,
   consistent prefix across every entry before stripping it — because the
   timeline node now carries that same meaning visually.)
3. **Deep-filled emphasis** (`PricingCard`, packages) — see below.

**Packages, specifically.** The recommended tier is a genuinely different
object, not a lighter card with a ring around it: a deep `primary` fill,
white text, a low-opacity decorative leaf mark in its notched corner, and
`shadow-package` — the deepest shadow in the system, added for this. The
other tiers stay on white but share the same shape, a matching leaf-icon
divider above the price, and circle-badged checkmarks instead of bare
glyphs, so all tiers read as one family at different intensities. The
non-colour redundant cues (fill, not just a ring; elevation; badge text)
are deliberate — recommendation has to survive for a colour-blind or
low-vision visitor without relying on `primary` vs `surface` alone.

**One floating device, used once.** The doctor-preview photo carries a
credential chip (`6+ years experience` — the same figure already shown in
the hero, not a new statistic) overlapping its corner. This is the "one
premium-editorial flourish" per the brief's restraint principle; it isn't
repeated elsewhere.

**Section rhythm.** Backgrounds alternate `surface-muted` / plain
`background` / `primary-soft` down the page with no two adjacent sections
sharing a value — verified against the actual rendered sequence, not
assumed from the class names.

## What this pass deliberately did not touch

- **Reviews.** The screenshot-authenticity carousel is a previous,
  deliberate decision (real social-proof screenshots, not styled
  testimonial cards) and stays as-is. No aggregate rating stat was added —
  the preview section only ever fetches 6 reviews, and presenting an
  average computed from a partial fetch as if it were the real number
  would be a fabricated-sounding statistic from real data, which is worse
  than not having one.
- **Recipe/video card *content* and grid composition** — only their shell
  shape and image treatment changed (`SURFACE_NOTCHED`, a bottom scrim for
  chip legibility). They're shared with `/recipes` and `/videos` (the "one
  canonical card per domain" rule already in place before this pass), so
  those pages inherit the improved card as a side effect — expected and
  desired, not scope creep, since cards were the explicit priority.
- **`PageHeader`'s `h1` path** (recipes/videos/reviews/packages/books/
  consultation page mastheads) is untouched and pixel-identical. Only its
  `h2` path — verified to be exclusively `SectionHeader`'s homepage-preview
  usage, no other call site passes `as="h2"` — picked up the heavier
  display weight.
- **Books, consultation, FAQ page, and every other page's own composition**
  — not part of this pass at all.

## Verification

`tsc --noEmit` clean, `eslint` clean, all 34 existing tests pass, `next
build` clean. Browser-verified at 1440 and 375 in both `/ar` and `/en` —
including one real bug caught this way: the program-highlights connecting
line first shipped at zero width (a `border-end-end-radius`-style logical
property mixed with a physical `inset-x` shorthand collapsed it), found by
checking `getBoundingClientRect()` rather than trusting the screenshot,
and a second pass where the trust-band watermark numeral was almost
entirely clipped out of frame at the mobile `text-display` size before its
offset was corrected.
