# Production asset requirements

Originally measured in a real browser against the implemented layout on
2026-08-22, at 375 / 768 / 1440 / 1920 in both `/ar` and `/en`. Updated the same
day, second pass: seven candidate files landed in `public/images/` —
`doctor.png`, `hero-section.png`, `logo-mobile.png`, `logo.svg`,
`mobile-hero-section.png`, plus the already-audited `leaf.svg`. This revision
records what was inspected, what got wired into the real implementation, what
was left out and why, and what is still genuinely missing.

Read `## What this pass changed` first for the outcome; `## The asset table`
below it still carries the numbers for what remains outstanding.

## What this pass changed

**Wired in, browser-verified at 375/768/1024/1440 in both locales:**

- **Header logo → `logo-mobile.png`.** The CMS-driven full mark (leaf + script
  wordmark + illustrated figure) was measurably illegible at the header's real
  40-48px render — confirmed by screenshotting the live header and zooming into
  the captured pixels, not by eye. The supplied compact mark (just the
  leaf-in-circle) reads clean at that size. The header no longer takes a `logo`
  prop at all; `SiteHeader`'s CMS-logo branch is gone, so it's independent of
  `siteSettings.logo` now. See `site-header.tsx`.
- **Hero desktop/mobile artwork → `hero-section.jpg` / `mobile-hero-section.jpg`**
  (converted from the supplied PNGs — see below). Wired into `HERO_ARTWORK` for
  **both locales from one pair**, not four masters — see `constant/hero-artwork.ts`
  for the symmetry measurement that justified this.
- **Doctor hero portrait → `doctor.png`.** Replaces the hero's CMS-avatar/circle
  treatment with the supplied transparent cutout, `object-contain`, no circular
  mask. See `constant/hero-portrait.ts` for why this is deliberately a different
  asset from `doctorProfile.avatar` (still used, unchanged, in
  `doctor-preview-section.tsx`, `doctor-intro-section.tsx`,
  `consultation-trust-panel.tsx`).
- **Favicon → derived from `logo-mobile.png`.** `src/app/favicon.ico` replaced
  (1.06 MB → 6.8 KB, real 16/32/48 multi-resolution ICO, alpha preserved); added
  `src/app/apple-icon.png` (180×180, flattened to opaque white — there wasn't one
  before). Both are Next's file-based icon convention, so no code/metadata
  change was needed; verified the real `<link rel="icon">` /
  `<link rel="apple-touch-icon">` tags in the rendered page.

**Inspected and deliberately not wired in:**

- **`logo.svg`.** Audited structurally before use, not assumed usable from the
  extension (see `## logo.svg audit` below). It's an auto-traced bitmap — real
  vector paths, but traced from a raster, with an opaque full-canvas background
  rect and a handful of stray near-white trace-artifact paths. The background
  rect is a one-line mechanical strip (confirmed: exactly one path, exact
  full-canvas bounds, exact single fill match), and the traced vector renders
  genuinely crisp at any size — measured via canvas pixel sampling in a real
  page, not eyeballed. **Not used anyway**, because `siteSettings.logo` (the
  CMS field the header used to read and the footer still does) is *already* a
  612×408 PNG of the same composition, with real verified alpha transparency —
  fetched and inspected directly, not assumed from the CMS record. There is no
  quality gap this file would close for the CMS-driven placements. It would only
  matter if a genuinely vector-optimized logo pipeline were wanted later, which
  also needs a `next.config.ts` decision (`images.dangerouslyAllowSVG`, unset
  today) — flagged below as a follow-up, not made silently.
- **`leaf.svg`.** Already audited (`## Audit of the supplied leaf.svg` below):
  structurally unusable for a line-draw. Checked again this pass for static use
  and found it's **the same 1536×1024 canvas as the already-deployed
  `books/footer-leaf.png`** — almost certainly a re-trace of that exact file —
  and it's heavier (2.43 MB vs 1.45 MB) for no visual gain. The existing footer
  botanical treatment is untouched; this file adds nothing over it, static or
  animated.

**Still genuinely missing / open:**

- **A true vector icon (`icon.svg`)** for the favicon set. What's supplied
  (`logo-mobile.png`) is raster; the ICO/PNG pair above covers every real
  surface (browser tab, iOS home screen) so this isn't blocking, just not
  best-case.
- **Desktop hero resolution.** The supplied `hero-section.png` is 1672×941
  against a 3200×1800 ask — see the measured shortfall below. Wired in anyway
  because it's a large improvement over the previous provisional asset, but
  it's a real, specific gap, not a rounding error.
- **Footer logo legibility.** Still the CMS raster mark at 84×56 — better than
  the header was (the leaf-and-circle read fine; "Omnia" and the figure are
  soft, not illegible), so left alone rather than changed pre-emptively.
  Zoomed screenshot evidence below.
- **Botanical line-draw animation.** Unchanged blocker — see the existing audit.
- **A proper vector botanical asset** for that animation — still needed,
  requirements below are unchanged and still current.

## logo.svg audit (2026-08-22)

Same method as the `leaf.svg` audit: structure inspected directly, not inferred
from the file extension.

| Measured | Value |
|---|---|
| Canvas | `viewBox="0 0 1536 1024"` (**3:2** — matches the header/footer spec) |
| `<path>` elements | 528 |
| Paths with a `stroke` | 0 (traced fills only, as expected for a logo mark) |
| Distinct fill colours | 519 |
| Background | **One path**, `d="M0 0 C506.88 0 …"` spanning the full 1536×1024 canvas,
  `fill="#FCF7F4"` — an opaque near-white rect, present exactly once |
| Real content transparency | Confirmed by removing that one path and sampling
  the render on a canvas in a real page: ~91% of a 30×20 sample grid came back
  `alpha=0`; the leaf/wordmark/figure paths came back fully opaque in their own
  colours. A few near-white trace-artifact paths remain (expected from
  auto-tracing) — harmless on light or white grounds, where they're
  indistinguishable from the ground |
| Crispness at real render size | Rendered at the literal 60×40 and 84×56 CSS
  boxes in a real page and sampled via canvas — genuinely sharp, no bitmap
  downscale blur, because it's vector geometry even though it was produced by
  tracing |

**Why it wasn't used anyway:** the CMS `siteSettings.logo` (612×408 PNG, fetched
and confirmed to have real alpha at every sampled pixel) is the same design,
already transparent, already the right aspect, at 8-10× the pixels the header
or footer ever renders it at. Swapping in a heavier traced SVG with known
tracing artifacts would be a lateral move at best. Recorded here so the file
isn't silently ignored, and so "should the logo pipeline become SVG-based" is a
real, answerable question later rather than a re-investigation.

## Measured rendered sizes

| Surface | 375 | 768 | 1440 | 1920 | Aspect | Served today |
|---|---|---|---|---|---|---|
| Header logo | 40×40 | 40×40 | 48×48 | 48×48 | **1:1** | `logo-mobile.png`, 1254×1254 |
| Footer logo | 84×56 | 84×56 | 84×56 | 84×56 | **3:2** | CMS `siteSettings.logo`, 612×408 |
| Footer botanical | 112×75 | 176×117 | 320×213 | 320×213 | **3:2** | `books/footer-leaf.png`, unchanged |
| Hero artwork box | 383×493 | 424×544 | 1440×1037 | 1921×1037 | **0.78 below `xl`, 1.23-1.85 above** | `hero-section.jpg` 1672×941 (desktop), `mobile-hero-section.jpg` 1122×1402 (mobile) |
| Doctor portrait | ~343×429 | ~384×480 | ~512×640 | ~512×640 | **4:5 box, `object-contain`** | `doctor.png`, 1254×1254 canvas, ~983×1246 real content (alpha bbox) — 0.79:1 |

## What is still wrong

1. **Desktop hero artwork is under-resolved.** `hero-section.png`/`.jpg` is
   1672×941; the artwork box reaches 1921×1037 at a 1920px viewport, so the
   widest common desktop width upscales the source by roughly 15%, with zero
   headroom for high-DPI beyond that. A 3200×1800 re-export would close this
   with real margin. Mobile is fine as supplied: 1122×1402 against a largest
   panel render of 552×704 is almost exactly the 2× minimum needed.
2. **Footer logo is still a raster, still a little soft at 84×56** (zoomed
   screenshot: the leaf-and-circle reads fine, "Omnia" and the illustrated
   figure are legible but not crisp). Not illegible the way the header was, so
   left as-is rather than changed without being asked.
3. **The botanical line-draw is still blocked** — see the audit below,
   unchanged.
4. Two of the nine originally-requested files were never supplied and remain
   open: a true vector `icon.svg`, and the botanical line-art SVG.

## The asset table

Dimensions are **source/master** pixels. Sections below marked **Delivered**
describe what was supplied and used; the numbers are kept for reference against
what's actually in the repo. Sections marked **Still needed** are unchanged asks.

### 1. Favicon — Delivered (derived from the compact mark, not separately supplied)

`favicon.ico` (16/32/48, alpha preserved, 6.8 KB) and `apple-icon.png`
(180×180, flattened to opaque white, 20.6 KB) generated from `logo-mobile.png`.
A true `icon.svg` is still a nice-to-have, not supplied, not blocking — both
real consuming surfaces (browser tab, iOS home screen) are covered.

### 2. Desktop header logo — Delivered

`logo-mobile.png` used directly, `object-contain`, no crop. 1254×1254 source
against a 48×48 max render is enormous headroom — no retina concern.

### 3. Mobile compact / round logo — Delivered

Same file as #2 — there's no separate breakpoint-swap in the header; the
compact mark is now the *only* header mark, at every width, which is what the
original "detailed illustration reads as a smudge at 40px" finding actually
called for.

### 4. Footer logo — Still the CMS raster mark, not changed

| | |
|---|---|
| Current | `siteSettings.logo`, 612×408 PNG, real transparency, 3:2 |
| Rendered | 84×56 at every breakpoint |
| Finding | Legible but soft at real size (zoomed-screenshot evidence, not assumed) |
| If it should be sharpened | Either a from-scratch higher-res re-export, or a
  vector logo pipeline (see the `logo.svg` audit above) — both are follow-ups, not
  done this pass |

### 5. Arabic hero artwork — Delivered, resolution gap noted

| | |
|---|---|
| Now | `hero-section.jpg` (desktop, 1672×941) + `mobile-hero-section.jpg`
  (mobile, 1122×1402), converted from the supplied PNGs — quality-88 JPEG,
  mean per-channel difference under 1.1/255 against the source, 84-86% smaller |
| Still wanted | Desktop re-export at **3200×1800** to close the ~15% upscale
  at 1920px and add real retina headroom. Mobile is already sized correctly |
| Aspect | 16:9 desktop; **4:5** mobile |
| Safe area | **Resolved differently than planned.** The supplied artwork is a
  *symmetric* botanical border around a quiet centre, not a two-zone
  composition with an offset quiet side — measured column-density left-half vs
  right-half within 1-3%. So the "leave the inline-start 55% quiet" requirement
  from the original spec doesn't apply to this artwork; see `constant/hero-artwork.ts` |

### 6. English hero artwork — Delivered from the same pair, not a separate master

**Resolved differently than the original plan.** The original ask assumed the
copy's quiet zone would sit on opposite physical sides per locale, requiring
separately composed `/ar` and `/en` masters. The supplied artwork doesn't have
that directional structure — it's a symmetric border, measured (above) — so one
desktop/mobile pair serves both locales correctly, browser-verified at 375 and
1440 in both directions with no visible mismatch. `HeroArtwork` still keys by
locale in code, so a future directional asset can still be dropped in per
locale without a refactor.

### 7. Doctor hero portrait — Delivered, different presentation than planned

| | |
|---|---|
| Supplied | `doctor.png`, 1254×1254 canvas, real alpha (corners sampled
  `(0,0,0,0)`), content bounding box ~983×1246 — **0.79:1**, almost exactly the
  4:5 box it now sits in |
| Presentation | **`object-contain`, no circular mask** — not the
  `rounded-full`/`object-cover` treatment the original spec assumed. The
  supplied file is a pre-composed cutout, not an arbitrary rectangular photo, so
  cropping it into a circle would cut through the shoulders and crossed arms
  instead of respecting the silhouette the asset already has |
| Relationship to the CMS avatar | **Deliberately separate.** `doctorProfile.avatar`
  (731×1280 Cloudinary photo) still renders unchanged everywhere else the
  doctor's photo appears. This file is hero-only, local, not CMS-managed — see
  `constant/hero-portrait.ts` |

### 8. Botanical vector, for the line-draw animation — Still blocked

Audit unchanged from the previous pass (`leaf.svg` is a traced bitmap, no
stroked geometry) and reconfirmed this pass: it also duplicates the
already-deployed `footer-leaf.png` at greater weight, so there's no static use
for it either. Full requirements below, unchanged.

## Audit of the supplied `public/images/leaf.svg` (2026-08-22, reconfirmed)

> **It cannot drive a line-draw animation.** That is not a judgement about the
> artwork — it is a structural fact about the file, which is an auto-traced bitmap
> rather than line art. Inspected, not inferred from the extension:
>
> | Measured | Value | Needed |
> |---|---|---|
> | File size | **2,430,906 bytes (2.43 MB)** | under ~20 KB |
> | `<path>` elements | **3,586** | under ~40 |
> | Paths with a `stroke` | **0** | all the drawn ones |
> | Paths with a `fill` | **3,586** | leaf bodies only |
> | `fill="none"` paths | **0** | one per drawn line |
> | `stroke-width` declarations | **0** | one, uniform |
> | Closed subpaths | **2,866 of 2,866** | drawn lines must be open |
> | Distinct fill colours | **3,037** | a handful |
> | `viewBox` | **missing** (only width/height, 1536×1024) | `0 0 1536 1024` |
> | `id` attributes | **0** | one per drawn path |
> | `transform` attributes | **3,586** | none on drawn paths |
> | Coords with 5+ decimals | 15,118 in the first 400 KB | — |
>
> **Why those numbers mean it cannot work.** A line-draw animates
> `stroke-dashoffset` along the *length of a stroked path*. Every path here is a
> closed, filled polygon with **no stroke**, so there is no length to draw along.
> Adding strokes would outline 3,586 blobs of colour at once — not a plant being
> drawn — and animating 3,586 elements would be a serious performance problem
> regardless.
>
> **3,037 near-identical dark greens** (`#050703`, `#060804`, `#040603`...) plus
> 8-decimal coordinates are the signature of a raster-to-vector trace: the PNG
> approximated blob by blob. It is an SVG container holding a bitmap.
>
> **Reconfirmed this pass: it's also a duplicate.** Same 1536×1024 canvas as the
> already-deployed `books/footer-leaf.png` (1,447,186 bytes) — almost certainly a
> re-trace of that exact file — and 2,430,906 bytes is heavier for identical
> content. Not worth swapping in even as a static decoration; the existing PNG
> is smaller and already deployed.
>
> **What to change, concretely.** The artwork looks right; the export is wrong.
> It needs to be drawn or re-exported as line art rather than traced:
>
> 1. Stem and each leaf vein as an **open `<path>` with `fill="none"` and a
>    `stroke`** — these are the elements that draw.
> 2. A **`viewBox="0 0 1536 1024"`** on the root, so it scales into the existing
>    placement with no layout change.
> 3. An **`id` on every drawn path**, named in draw order (`stem`,
>    `leaf-1-vein`, ...), so the stagger can follow the plant outward.
> 4. **One uniform `stroke-width`**, no tapering.
> 5. **No `transform` on drawn paths** — bake rotation into the path data.
> 6. Leaf bodies may stay filled; they fade in behind their vein.
> 7. Whole file **under ~20 KB**, under ~40 stroked paths.
>
> Until that arrives the animation stays blocked and the existing PNG remains the
> static decoration.

**Which artwork:** the **existing footer leaf**, not a new decoration. It is the
established "Botanical Trust" signature element and the only botanical artwork on
the site; introducing a second one would create a second visual language rather
than animate the one that exists. Today it is `public/images/books/footer-leaf.png`,
1536×1024, 1,447,186 bytes.

**Where it appears:** the footer's inline-start bottom corner, behind the brand
block. Absolutely positioned, `pointer-events-none`, `opacity-60`, and mirrored
for RTL with `rtl:-scale-x-100`. Rendered 112×75 (375) → 176×117 (768) →
320×213 (≥1024). It is decorative: empty `alt` **and** `aria-hidden`.

**What it should look like:** the same leaf cluster it is now — a stem entering
from the corner with leaves fanning into the page. The animation is a
**line-draw**: the stem and leaf veins draw on as the footer enters view, once,
then hold. Nothing loops, nothing moves after settling.

| Requirement | Value |
|---|---|
| Format | **SVG**, hand-authored paths — not an auto-traced PNG, which produces thousands of unusable points |
| Canvas / viewBox | **`viewBox="0 0 1536 1024"`** — keeping today's 3:2 means it drops into the existing box with no layout change |
| Aspect | 3:2 |
| Rendered | up to 320×213 |
| RTL/LTR variants | **One asset.** The existing `rtl:-scale-x-100` mirror is correct for a decorative botanical, and a line-draw mirrors cleanly. This is the opposite of the hero, where mirroring photographic content would be wrong |
| Background | Transparent |

**What must be real paths, and how they need to be structured:**

- **The stem and every vein must be `<path>` elements with `stroke`, not filled
  outlines.** A line-draw works by animating `stroke-dasharray`/`stroke-dashoffset`
  along a stroked path. A filled silhouette has no length to draw and cannot be
  animated this way — this is the single most important requirement here.
- **Group them in draw order** and give each a stable `id` (`stem`,
  `leaf-1-vein`, …). The animation staggers along the stem and then out into the
  leaves; without ordered, identifiable paths that stagger has to be guessed.
- **Leaf bodies may stay as filled paths.** They fade in behind their vein rather
  than drawing, which is both cheaper and closer to how a plant reads.
- **No `transform` attributes on the animated paths.** The motion system treats
  competing transforms on one element as its highest-risk pattern; bake any
  rotation into the path data.
- **Uniform `stroke-width`, no tapering strokes**, so the draw reads evenly.
- Keep the whole file **under ~20 KB** and under roughly 40 stroked paths. It is a
  decorative element at 320px wide; more detail is invisible and costs frame time.

Once that asset exists, the animation itself is layer 2 work and already
constrained: decorative surfaces only, one ambient element per viewport, and it
must not run under `prefers-reduced-motion`.

## Summary of what's still needed

| # | File | Source px | Format | Status |
|---|---|---|---|---|
| 1 | `icon.svg` (true vector favicon) | vector | SVG | Open, non-blocking |
| 2 | Desktop hero re-export | 3200×1800 | JPEG | Open — current 1672×941 works but upscales ~15% at 1920px |
| 3 | Footer logo, sharper | vector, or ≥1024×683 | SVG / PNG-24 | Open — current is legible, not crisp |
| 4 | Botanical line-art | `viewBox 0 0 1536 1024`, stroked paths | SVG | Open, blocking the animation |

Everything else originally requested (favicon raster set, header/compact logo,
hero mobile master, doctor portrait) is delivered and browser-verified.
