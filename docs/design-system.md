# nutrition-client design system

This document is the "why/what" of the visual language for Dr. Omnia's public
site — the brand story, palette rationale, typography decisions, and the
structural rules every page follows. For the raw token API (CSS custom
property names, Tailwind class mappings, correct/incorrect usage examples),
see [`theme.md`](./theme.md).

This is a complete rewrite — nothing here preserves the old MUI site's visual
language. It exists to make the site feel natural, warm, modern, medically
trustworthy, and human: premium without being luxurious, supportive rather
than clinical. It must never read as a generic SaaS dashboard, a hospital
template, a stock "green wellness" landing page, or a template with the
doctor's name dropped in.

## The palette

The current site's brand color is a teal-green family (`#007B7F`, `#4db6b2`,
and an informally-used `#04715d` scattered across dozens of components as raw
hex strings). Rather than discard that brand identity, the new palette refines
it into a real, coherent system — the doctor's existing visual identity
carries forward; the inconsistency around it does not.

| Token | Value | Role |
|---|---|---|
| `primary` | `#146356` | Deep, natural teal-green. Primary CTAs, links, active states, brand marks. |
| `primary-hover` | `#0f4e44` | Hover/pressed state for anything using `primary`. |
| `primary-soft` | `#e4f1ec` | Very light minty tint — soft backgrounds, badges, the hero gradient. |
| `accent` | `#8f5f22` | Warm gold/bronze. A genuinely different hue from primary, reserved for highlight moments: `titleAccent` text, "popular" tags, stat numbers, campaign emphasis. |
| `accent-hover` / `accent-soft` | `#714a1a` / `#f8ecd9` | Hover and soft-tint pairs for `accent`, mirroring `primary`'s structure. |
| `background` | `#fbf9f4` | Warm off-white page background — never stark white. |
| `surface` | `#ffffff` | Cards and raised content sit on true white, creating gentle depth against the warm background. |
| `surface-muted` | `#f3f0e8` | Alternate section backgrounds, muted panels. |
| `text-primary` / `text-secondary` / `text-muted` | `#1b231f` / `#445048` / `#5c6660` | A warm near-black rather than pure black, softening the reading experience without sacrificing contrast. |
| `success` / `warning` / `destructive` | `#237a47` / `#96600f` / `#c1432e` | Deliberately distinct from `primary` and `accent` so status meaning is never ambiguous. |
| `focus` / `focus-on-dark` | `#1d8570` / `#ffffff` | Two ring colors, not one — see "Accessibility & contrast" below for why a single focus color can't serve both light and dark/filled surfaces. |
| `disabled-bg` / `disabled-text` | `#e3e0d6` (= `border`) / `#5c6660` (= `text-muted`) | Reused rather than new colors — disabled controls should look like "the border/muted-text pairing," not introduce a fourth neutral tone. |

**This revises the first draft of this palette.** `accent` was originally
`#c98a3e` and `success`/`warning` were originally `#2f9e5c`/`#b8791c` —
all three were measured (not assumed) to fail WCAG AA in at least one of
their real use cases (white text on the fill, or the color used as text on
`background`). `text-muted` was originally `#78847c`, which also measured
below AA for normal text. Every value above has been recomputed and the
ratios recorded in "Accessibility & contrast" below — this is not a
cosmetic revision, it's a correction of an unverified first pass.

**Why two hues, not one flat green everywhere**: the brief explicitly warns
against a single flat green covering the whole site. `primary` (trust,
action) and `accent` (warmth, celebration) let hierarchy come from color
*meaning*, not just tone — a "popular" package tag or a campaign countdown
number should never compete visually with a plain "Book Consultation" button,
and vice versa.

**Dark mode**: `tailwind.config.ts` declares `darkMode: "class"` so the
system is structurally ready, but no `.dark` values are shipped in v1. There
is zero dark-mode precedent anywhere in this ecosystem today, and a
half-finished dark theme would violate the project's own "no half-finished
implementations" standard more than it would help anyone. Revisit only if
explicitly requested.

## Typography

**One bilingual family, not a Latin/Arabic pairing.** The typeface is
[Cairo](https://fonts.google.com/specimen/Cairo) — a typeface designed from
the outset to cover Arabic and Latin scripts as one coherent system, loaded
once via `next/font/google` (self-hosted, subset to `arabic` + `latin`,
weights 400–800). This was a deliberate choice over pairing two separate
"Arabic-capable" and "Latin" families: a single well-designed bilingual
family guarantees the two locales share weight, rhythm, and personality
automatically, rather than relying on two different type designers' choices
to happen to feel like the same brand. Hierarchy (display vs. body vs. label)
comes entirely from the size/weight/line-height scale in `theme.md`, not from
switching typefaces.

**Arabic gets its own line-height, not the Latin values reused.** Arabic text
runs visually longer than Latin for equivalent content, so `html[lang="ar"]`
overrides the *content* line-height tokens (`heading-1/2/3`, `body*`) to be
more generous — see `globals.css`. Display and label/caption sizes are left
alone: display type is already loose enough to not need it, and
label/caption content is short enough in both languages that added leading
would just look inconsistent.

**Numerals**: package prices and countdown digits currently render with
Western numerals by default (no `dir`/`lang`-based numeral substitution is
applied). Whether Arabic-locale visitors expect Eastern Arabic numerals
(٠–٩) in a commercial/pricing context is a real open question — Egyptian
commercial usage commonly keeps Western numerals even in Arabic UI, but this
should be confirmed with the client before launch rather than assumed either
way (carried over from the approved plan's risk list).

## Spacing & containers

Tailwind's default spacing scale (0.25rem increments) is kept as-is — it's
already a proven, fine-grained scale and reinventing it would add a second
mental model for zero benefit. On top of it, a small set of *semantic*
spacing tokens exists for the patterns that repeat everywhere: `section-y` /
`section-y-sm` (vertical rhythm between major page sections, responsive via
`clamp()` so it scales smoothly rather than jumping at a breakpoint) and
`content-gap` (the default gap inside a section's content stack).

Three container widths, all `clamp()`-free (fixed caps, since a max-width
should stop growing, not keep scaling with the viewport):

- `narrow` (42rem / ~65ch) — the plain-text measure for campaign `richText`
  blocks and anything else that's pure reading content. A fixed measure here
  is what makes plain paragraphs (no rich formatting allowed in that block
  type) feel designed instead of sprawling edge-to-edge on desktop.
- `content` (72rem) — the standard page content width used by the vast
  majority of sections.
- `wide` (90rem) — full-bleed-adjacent moments (campaign hero/media blocks)
  that should feel more expansive than a normal content column but still
  stop short of the raw viewport edge on very large screens.

**Breakpoints are Tailwind's untouched defaults** (`sm` 640px, `md` 768px,
`lg` 1024px, `xl` 1280px, `2xl` 1536px) — deliberately not redefined. Mapped
to the project's own mobile/tablet/desktop language: mobile is `<640px`,
tablet is `640–1024px`, desktop is `≥1024px`. Every page is designed mobile
first at these breakpoints, expanded intentionally for tablet, then given a
genuinely composed desktop treatment — never a stretched mobile layout (see
the approved plan's "Mobile / Tablet / Desktop" section for the full
per-page rules; this document only fixes the breakpoint vocabulary).

## Card & surface families (structure, not components yet)

Component implementation comes in Phase 6, but the *system* they'll draw from
is fixed now so nothing gets built ad hoc later:

1. **Soft-paper content surface** — `surface` fill, `border` hairline,
   `shadow-sm`/`shadow-md`, `radius-lg`. The default for recipe cards, review
   cards, FAQ rows' container, most everyday content.
2. **Deep-filled emphasis surface** — `primary` or `accent` fill (or a
   `gradient-cta`/`gradient-hero` background), higher-contrast text on top,
   `shadow-raised` for the single most-emphasized element on a page (e.g. the
   popular package tier). Used sparingly — if everything is emphasized,
   nothing is.
3. **Borderless editorial block** — no fill, no border, no shadow;
   hierarchy comes purely from typography, spacing, and a `border` rule line
   or `accent` color pop. Used for doctor bio sections, trust/benefit bands,
   and anywhere the brief calls for "editorial," not "card," treatment.

Each content type in the plan (packages, recipes, reviews, videos, FAQ,
trust/benefit items) maps to exactly one of these three families with its
own composition on top — never one generic rounded-rectangle-plus-shadow
reused for every content type. See the approved plan's "Card & surface
system" section for the per-type composition rules.

## Accessibility & contrast

Every pairing below was computed from the WCAG 2.x relative-luminance
formula (not estimated) against the exact hex values in `globals.css`. AA
thresholds: **4.5:1** for normal text, **3:1** for large text (≥18pt, or
≥14pt bold) and for non-text UI indicators like focus rings (WCAG 1.4.11).

| Foreground | Background | Ratio | Passes |
|---|---|---|---|
| `text-primary` | `background` | 15.3:1 | AA + AAA |
| `text-primary` | `surface` | 16.1:1 | AA + AAA |
| `text-secondary` | `background` | 8.0:1 | AA + AAA |
| `text-muted` | `background` | 5.7:1 | AA (normal text) |
| `text-muted` | `surface` | 6.0:1 | AA (normal text) |
| `primary` (as text) | `background` / `surface` | 6.8:1 / 7.1:1 | AA + AAA |
| white | `primary` fill | 7.1:1 | AA + AAA |
| white | `primary-hover` fill | 9.6:1 | AA + AAA |
| `text-primary` | `primary-soft` fill | 13.9:1 | AA + AAA |
| `accent` (as text) | `background` / `surface` | 5.2:1 / 5.5:1 | AA |
| white | `accent` fill | 5.5:1 | AA |
| white | `accent-hover` fill | 7.8:1 | AA + AAA |
| `text-primary` | `accent-soft` fill | 13.8:1 | AA + AAA |
| white | `success` fill | 5.3:1 | AA |
| `warning` (as text) | `background` | 5.0:1 | AA |
| white | `warning` fill | 5.3:1 | AA |
| white | `destructive` fill | 5.1:1 | AA |
| `destructive` (as text) | `background` | 4.9:1 | AA |
| `focus` ring (single) | `surface`/`background` | 4.5:1 / 4.3:1 | Passes 3:1 non-text minimum with margin |
| `focus-on-dark` inner band (white) | `primary` / `primary-hover` / `accent` / `accent-hover` fill | 7.1:1 / 9.6:1 / 5.5:1 / 7.8:1 | Passes 3:1 non-text minimum |
| `focus-on-dark` outer band (green) | `background` / `surface` / `primary-soft` / `accent-soft` | 4.3:1 / 4.5:1 / 3.9:1 / 3.9:1 | Passes 3:1 non-text minimum |
| `disabled-text` | `disabled-bg` | 4.5:1 | Not required by WCAG for inactive controls, but met anyway |

**A two-layer ring for filled controls, not a single color swap.** The
original single `focus` color (`#1d8570`) measured only **~1.6:1 against
`primary`** — nearly invisible as a ring around a primary-filled button. A
second attempt (just swapping to a plain white ring for filled controls)
creates the opposite failure: white contrasts fine against the button's own
fill, but can under-contrast against a light page once `outline-offset`
clears the button's edge. `focus-ring-on-dark` (see `globals.css`/`theme.md`
for the exact rule) resolves this with genuinely two bands: an inner
`box-shadow` band in `focus-on-dark` (white) against the control's fill, and
an outer `outline` band in `focus` (green) against whatever the control is
sitting on. The outer band deliberately uses `outline` rather than a second
`box-shadow` specifically because `outline` is preserved with a
system-drawn color under forced-colors/high-contrast mode — the one layer
most likely to matter there. `focus` alone remains correct for
non-filled controls (inputs, links, anything on `background`/`surface`),
since that single ring already clears 4.3–4.5:1 against both.

**`accent` and `success`/`warning` were darkened from their first-draft
values** specifically because the original hex values failed AA when
actually measured — see the palette table above for the before/after
values. This is the corrected, verified set; nothing here is aspirational.

**`text-muted` is restricted by convention, not just by contrast.** It
technically clears AA now (5.7:1), but its role is deliberate
de-emphasis — prefer `text-secondary` for any caption/metadata/label that's
essential to understanding the content, and reserve `text-muted` for
genuinely decorative or skippable text (e.g. a timestamp no one needs to
read to use the page).

**Still to verify once real components exist in Phase 6**: these ratios are
all foreground-vs-flat-background-color math; they don't yet account for
text sitting on a photo, a gradient, or a scrim overlay (e.g. campaign hero
text over an image) — those need a per-instance check against the actual
rendered composite, not just the token pairing, once those components are
built.

## Motion tokens

Duration and easing values have exactly one canonical source —
[`src/lib/animation/motion-tokens.json`](../src/lib/animation/motion-tokens.json)
— not two hand-maintained copies. `motion-tokens.ts` reshapes that JSON into
GSAP-friendly constants (seconds, not ms) for animation code to import, and
`scripts/generate-motion-css.mjs` generates the matching
`--duration-*`/`--ease-*` CSS custom properties from the *same* JSON file
for the small number of plain-CSS transitions that aren't GSAP-driven (hover
color changes, etc). The generator runs automatically via the `predev`/
`prebuild` npm scripts, so the generated CSS can never drift out of sync
with the JSON — there's nothing to hand-edit on the CSS side, and the
generated file isn't committed to git (see `.gitignore`). See `theme.md` for
the exact values and when to use each one. No animation code should
hardcode a duration or ease curve — every GSAP timeline reads from
`motion-tokens.ts`.

## Correct vs. incorrect token usage

See `theme.md`'s "Usage examples" section for the concrete right/wrong code
samples — this document stays at the level of *why* the system is shaped
this way; `theme.md` is the enforceable reference.
