# Theme token reference

The enforceable API for every design token in the project. For the
rationale/brand story behind these values, see
[`design-system.md`](./design-system.md).

**The hardcoding rule, precisely** (this is the actual rule — treat any
looser paraphrase of it elsewhere as shorthand for this):
- Standard Tailwind spacing/sizing utilities that ship with the framework
  (`p-4`, `gap-2`, `w-8`, `text-sm`, ...) are **allowed** — that scale is
  intentionally left untouched, there was never a reason to duplicate it.
- Arbitrary one-off values are **not allowed**: raw hex colors, bracket
  values (`p-[17px]`, `rounded-[8px]`, `duration-[280ms]`), inline
  animation durations/eases, made-up z-indexes. If a value doesn't exist as
  a token yet, add it to `globals.css`/`tailwind.config.ts` first — don't
  reach for a one-off.
- A **semantic token is required** for anything that's a repeating
  product-level pattern (a color, a section rhythm, a shadow depth, a
  z-index layer, a motion duration/ease) — that's what the tables below
  are. If a value isn't in this document and isn't one of Tailwind's own
  default utilities, it isn't a token — don't invent one inline.

**Source of truth**: CSS custom properties in
[`src/app/globals.css`](../src/app/globals.css), wired into Tailwind
utilities by [`tailwind.config.ts`](../tailwind.config.ts). Motion durations
and eases are the one exception to "CSS is the source" — their canonical
source is
[`src/lib/animation/motion-tokens.json`](../src/lib/animation/motion-tokens.json),
from which both `motion-tokens.ts` (GSAP constants) and the generated
`--duration-*`/`--ease-*` CSS custom properties are derived — see the
"Motion" section below for exactly how, and why there's no hand-maintained
duplicate to drift.

## Colors

| CSS variable | Tailwind class(es) | Value |
|---|---|---|
| `--color-background` | `bg-background` | `#fbf9f4` |
| `--color-surface` | `bg-surface` | `#ffffff` |
| `--color-surface-muted` | `bg-surface-muted` | `#f3f0e8` |
| `--color-text-primary` | `text-text-primary` | `#1b231f` |
| `--color-text-secondary` | `text-text-secondary` | `#445048` |
| `--color-text-muted` | `text-text-muted` | `#5c6660` |
| `--color-border` | `border-border` | `#e3e0d6` |
| `--color-primary` | `bg-primary` / `text-primary` / `border-primary` | `#146356` |
| `--color-primary-hover` | `bg-primary-hover` etc. | `#0f4e44` |
| `--color-primary-soft` | `bg-primary-soft` etc. | `#e4f1ec` |
| `--color-accent` | `bg-accent` / `text-accent` | `#8f5f22` |
| `--color-accent-hover` | `bg-accent-hover` | `#714a1a` |
| `--color-accent-soft` | `bg-accent-soft` | `#f8ecd9` |
| `--color-success` | `bg-success` / `text-success` | `#237a47` |
| `--color-warning` | `bg-warning` / `text-warning` | `#96600f` |
| `--color-destructive` | `bg-destructive` / `text-destructive` | `#c1432e` |
| `--color-focus` | (see Focus rings below) | `#1d8570` |
| `--color-focus-on-dark` | `focus-ring-on-dark` utility class | `#ffffff` |
| `--color-overlay` | `bg-overlay` | `rgba(15,23,20,.55)` |
| `--color-overlay-light` | `bg-overlay-light` | `rgba(27,35,31,.28)` |
| `--color-disabled-bg` | `bg-disabled-bg` | `#e3e0d6` (= `border`) |
| `--color-disabled-text` | `text-disabled-text` | `#5c6660` (= `text-muted`) |

`primary` and `accent` are Tailwind nested-key colors (`DEFAULT`/`hover`/
`soft`), so `bg-primary`, `bg-primary-hover`, and `bg-primary-soft` all
resolve correctly. Every pairing above has a verified WCAG contrast ratio
recorded in `design-system.md`'s "Accessibility & contrast" table — check
there before reusing a color in a new foreground/background combination
that isn't already listed.

## Typography

| CSS variable(s) | Tailwind class | Use |
|---|---|---|
| `--text-display` / `--leading-display` | `text-display` | Hero headline only — one per page, max. |
| `--text-heading-1` / `--leading-heading-1` | `text-heading-1` | Page/section titles (`h1`/`h2`). |
| `--text-heading-2` / `--leading-heading-2` | `text-heading-2` | Sub-section headings. |
| `--text-heading-3` / `--leading-heading-3` | `text-heading-3` | Card titles, smaller headings. |
| `--text-body-lg` | `text-body-lg` | Lead paragraphs, intros. |
| `--text-body` | `text-body` | Default body copy. |
| `--text-body-sm` | `text-body-sm` | Secondary/supporting copy. |
| `--text-label` | `text-label` | Form labels, nav items, small UI text. |
| `--text-caption` | `text-caption` | Metadata, timestamps, fine print. |
| `--text-button` | `text-button` | Button label size (no line-height baked in — buttons control their own). |
| `--text-stat` | `text-stat` | Large numeric callouts (stats, countdown digits). |
| `--font-sans` | `font-sans` | Cairo, self-hosted via `next/font/google` in `[locale]/layout.tsx`, applied through the `--font-cairo` variable it generates. |
| `--font-mono` | `font-mono` | System monospace fallback stack — no custom mono font loaded; used for tabular numerals where needed. |

`html[lang="ar"]` overrides the `--leading-*` variables for
heading-1/2/3/body*/body-sm only (not display, label, or caption) — see
`design-system.md` for why. This is automatic; components never need an
`ar`-specific className for line-height.

## Spacing, containers, sizing

| CSS variable | Tailwind class | Use |
|---|---|---|
| `--space-section-y` | `py-section-y` | Vertical padding between major page sections. |
| `--space-section-y-sm` | `py-section-y-sm` | Same, for shorter/denser sections. |
| `--space-content-gap` | `gap-content-gap` | Default gap within a section's content stack. |
| `--container-narrow` | `max-w-narrow` | ~65ch reading measure (campaign `richText` blocks, etc). |
| `--container-content` | `max-w-content` | Standard page content width. |
| `--container-wide` | `max-w-wide` | Full-bleed-adjacent sections. |
| `--touch-target-min` | `min-h-touch-min` / `min-w-touch-min` | Minimum interactive element size (44px) — apply to every tappable element, not just "important" ones. |
| `--control-height-sm/md/lg` | `h-control-sm` / `h-control-md` / `h-control-lg` | Button/input height variants. `md` already meets the touch-target minimum. |
| `--icon-size-sm/md/lg/xl` | `size-icon-sm` etc. (or `w-icon-sm h-icon-sm`) | Icon sizing scale, matches `lucide-react`'s sizing conventions. |

Everything else (numeric spacing like `p-4`, `gap-2`) uses Tailwind's
untouched default scale — there was no reason to duplicate a scale that
already works.

## Radii, shadows, borders, gradients

| CSS variable | Tailwind class | Value |
|---|---|---|
| `--radius-sm/md/lg/xl/full` | `rounded-sm/md/lg/xl/full` | `0.375rem` / `0.75rem` / `1.25rem` / `1.75rem` / pill |
| `--shadow-sm/md/lg` | `shadow-sm/md/lg` | Warm-tinted, never pure black — see values in `globals.css` |
| `--shadow-raised` | `shadow-raised` | Reserved for the single most-emphasized element on a page (e.g. the popular package card) |
| `--border-width-hairline/focus` | `border-hairline` / `border-focus` (width) | `1px` / `2px` |
| `--gradient-hero` | `bg-hero` | Hero section background |
| `--gradient-cta` | `bg-cta` | High-emphasis CTA fills |
| `--gradient-scrim` | `bg-scrim` | Text-legibility overlay on images (campaign hero/media blocks) |

## Motion

**Canonical source**: `src/lib/animation/motion-tokens.json`. Everything
else below is derived from it, not hand-duplicated:
- `motion-tokens.ts` reshapes it into GSAP-friendly constants (`DURATIONS`
  in seconds, `EASES` as GSAP ease strings). **This reflects the current code,
  not the current direction:** Motion is now the animation stack of record and
  GSAP is legacy pending migration (HANDOFF §9). The tokens and the JSON source
  stay authoritative either way — only this reshaping layer and its consumers
  change. The GSAP examples below remain accurate for the code as it stands today.
- `src/app/_generated/motion-tokens.css` (the `--duration-*`/`--ease-*` CSS
  custom properties) is **generated** from the same JSON by
  `scripts/generate-motion-css.mjs`, run automatically by the `predev` and
  `prebuild` npm scripts. That file is gitignored and never hand-edited —
  regeneration on every `dev`/`build` is what guarantees the CSS and the
  GSAP constants can't drift apart, rather than relying on a comment or a
  human remembering to update two files.

To change a duration or ease: edit `motion-tokens.json` only, then run
`npm run dev` or `npm run build` (or `node scripts/generate-motion-css.mjs`
directly) to regenerate the CSS.

| Token | GSAP (`motion-tokens.ts`) | CSS variable | Value | Use |
|---|---|---|---|---|
| fast | `DURATIONS.fast` | `--duration-fast` | 150ms | Micro-interactions (button press) |
| base | `DURATIONS.base` | `--duration-base` | 300ms | Default hover/small UI transitions |
| slow | `DURATIONS.slow` | `--duration-slow` | 500ms | Drawers, modals, sticky bar entrance |
| reveal | `DURATIONS.reveal` | `--duration-reveal` | 600ms | Scroll-triggered section reveals |
| standard | `EASES.standard` (`power2.out`) | `--ease-standard` | `cubic-bezier(.16,1,.3,1)` | Default general-purpose ease |
| emphasized | `EASES.emphasized` (`power3.out`) | `--ease-emphasized` | `cubic-bezier(.19,1,.22,1)` | Larger/slower movements |
| in-out | `EASES.inOut` (`power2.inOut`) | `--ease-in-out` | `cubic-bezier(.65,0,.35,1)` | Symmetric open+close (drawers, accordions) |
| soft | `EASES.soft` (`power1.out`) | `--ease-soft` | `cubic-bezier(.33,1,.68,1)` | Hero/first-paint entrances |

GSAP code: `import { DURATIONS, EASES } from "@/lib/animation/motion-tokens"`
— never hardcode `duration: 0.3` or `ease: "power2.out"` inline in a
component; reference the token so a future tuning pass changes one file, not
every call site. Plain-CSS transitions (e.g. a hover color change on a link)
use the Tailwind classes (`duration-base`, `ease-standard`) which read the
same generated CSS custom properties.

## z-index layers

| CSS variable | Tailwind class | Value | Layer |
|---|---|---|---|
| `--z-sticky-cta` | `z-sticky-cta` | 30 | Sticky mobile CTA bar |
| `--z-header` | `z-header` | 40 | Site header |
| `--z-drawer` | `z-drawer` | 50 | Mobile nav drawer, bottom sheets |
| `--z-modal` | `z-modal` | 60 | Lightbox, dialogs |
| `--z-toast` | `z-toast` | 70 | Toast notifications |
| `--z-tooltip` | `z-tooltip` | 80 | Tooltips (always on top) |

Ordering is deliberate: a drawer must cover the header, a modal must cover a
drawer, a toast must be visible over a modal, and a tooltip must never be
hidden by anything. If a new overlay type is needed later, slot it into this
ordering rather than picking an arbitrary number.

## Focus rings

`:focus-visible` is set globally in `globals.css` using `--color-focus`,
`--focus-ring-width` (2px), `--focus-ring-offset` (2px) — this single ring
is the default for controls sitting on `background`/`surface` (it already
measures ≥4.3:1 against both).

**Any element whose own fill is `primary`/`primary-hover`/`accent`/
`accent-hover` must instead add the `focus-ring-on-dark` class** — and this
is a genuine **two-layer** ring, not a single color swap:
- an inner band (`box-shadow`, white/`--color-focus-on-dark`) flush against
  the control, contrasting against the control's *own* fill;
- an outer band (`outline`, green/`--color-focus`) just beyond it,
  contrasting against whatever the control is *sitting on* — the page, a
  soft-tint surface, or another primary/accent-family section.

A single ring can't do both jobs: the default green ring measures ~1.6:1
against a `primary` fill (invisible on the button itself), but a
white-only ring can in turn under-contrast against a light page once the
ring clears the button's edge. The outer band deliberately uses `outline`
rather than a second `box-shadow` — `outline` is the one mechanism browsers
preserve with a system-drawn color in forced-colors/high-contrast mode, so
skipping this class on a primary/accent-filled button isn't a minor visual
miss, it's a keyboard-accessibility bug in normal use *and* a worse one
under forced-colors mode.

This doesn't provide a mathematical guarantee against an arbitrary photo
behind an image-backed hero CTA — that can't be computed from tokens alone
— but white-inner/green-outer sit at opposite ends of the lightness range,
which covers the two realistic failure modes (dark button on a light page;
same button on a saturated same-family section) better than one ring color
could. Verify it visually once real hero imagery exists in Phase 6.

Don't add any other custom focus styling beyond these two rules unless a
specific interaction genuinely needs it, and document why inline if so.

## Usage examples

**Correct** — every non-standard value traced to a token, ordinary Tailwind
spacing (`px-4`) used as-is, and the dark-surface focus ring added because
this button's fill is `primary`:
```tsx
<button className="bg-primary hover:bg-primary-hover focus-ring-on-dark text-white text-button rounded-md h-control-md px-4 shadow-sm">
  Book Consultation
</button>
```

**Incorrect** — raw values that bypass the system:
```tsx
{/* Don't do this: */}
<button style={{ background: "#146356", borderRadius: "8px", height: "42px" }}>
  Book Consultation
</button>
```
Even though `#146356` *is* the `primary` token's value, hardcoding it here
means a future palette adjustment requires hunting down every inline copy
instead of editing one CSS variable. The same applies to arbitrary bracket
values like `rounded-[8px]` or `duration-[280ms]` — if a token doesn't exist
yet for what's needed, add it to `globals.css`/`tailwind.config.ts` first,
don't reach for a one-off. (`px-4`, `gap-2`, and Tailwind's other *default*
spacing utilities are not part of this problem — see the hardcoding rule at
the top of this document.)

**Correct** — GSAP reading from tokens:
```ts
import { DURATIONS, EASES } from "@/lib/animation/motion-tokens";

gsap.to(el, { opacity: 1, y: 0, duration: DURATIONS.reveal, ease: EASES.standard });
```

**Incorrect** — magic numbers in animation code:
```ts
// Don't do this:
gsap.to(el, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" });
```
Functionally identical today, but the moment a second component copies this
literal instead of the import, the two will drift the first time either
value is retuned.

**Component-specific exceptions**: the plan allows limited, *documented*
component-specific values when something is genuinely a one-off (e.g. a
particular campaign hero's unique gradient). These must be commented inline
explaining why a token wasn't used, and should be rare — if the same
"exception" shows up in a second component, it isn't an exception anymore,
it's a missing token.
