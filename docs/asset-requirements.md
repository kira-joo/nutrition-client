# Production asset requirements

Every number here was **measured in a real browser against the implemented
layout** on 2026-08-22, at 375 / 768 / 1440 / 1920 in both `/ar` and `/en`, not
carried over from `asset-specs.md`. Where this disagrees with that document, this
one is current — the layout has changed since it was written.

Read `## What is wrong today` first: three of these assets are not merely
missing, they are actively under-resolved or oversized in production.

## Measured rendered sizes

| Surface | 375 | 768 | 1440 | 1920 | Aspect | Served today |
|---|---|---|---|---|---|---|
| Header logo | 60×40 | 60×40 | 72×48 | 72×48 | **3:2** | 96×64 |
| Footer logo | 84×56 | 84×56 | 84×56 | 84×56 | **3:2** | 96×64 |
| Footer botanical | 112×75 | 176×117 | 320×213 | 320×213 | **3:2** | matches box |
| Hero artwork box *(before)* | 375×**1458** | 771×**1390** | 1450×1044 | 1921×1037 | **0.26 → 1.85** | 1885×834 |
| Hero artwork box *(now)* | 383×493 | 424×544 | 1440×1037 | 1921×1037 | **0.78 below `xl`, 1.23–1.85 above** | 1885×834 |
| Doctor portrait | 343×429 | 384×480 | 512×640 | 512×640 | **4:5** | 512×896 |

The hero row is the important one: the box is a **tall portrait on phones and a
landscape band on desktop**. Its aspect ratio swings from 0.26:1 to 1.85:1 — a
factor of seven — which no single master can serve.

## What is wrong today

1. **The favicon is 1.06 MB.** `src/app/favicon.ico` is 1,062,495 bytes,
   declaring `sizes="1254x1254"`. A favicon should be single-digit kilobytes.
   There is also no `apple-icon`, no PNG variants and no web manifest.
2. **Both logos are under-resolved on any retina screen.** They render up to
   72×48 and 84×56 but are served at 96×64, so a 2× display needs 144×96 and
   168×112 and does not get them.
3. **The doctor portrait is under-resolved *and* mis-cropped.** Served 512×896
   (0.57:1) into a 512×640 (0.80:1) box, so `object-cover` discards about 29% of
   the image's height, and a 2× display wants 1024×1280.
4. **The hero artwork is upscaled even at 1× on a wide desktop** — the box is
   1921×1037 and the master is 1885×834 — and on a phone it covers a 0.26:1 box
   from a 2.26:1 source, showing roughly the middle 11% of the image.

## The asset table

Dimensions are **source/master** pixels. "Rendered" repeats the measured CSS box
so the multiplier is visible. Where a single master cannot serve a surface, that
is called out rather than averaged away.

### 1. Favicon

| | |
|---|---|
| Source | `icon.svg` — any viewBox, square, drawn to read at 16px |
| Plus | `apple-icon.png` **180×180**, and `favicon.ico` containing 16/32/48 |
| Aspect | 1:1 |
| Rendered | 16–32px browser tab; 180px iOS home screen |
| Format | **SVG** primary, PNG for `apple-icon`, ICO as legacy fallback |
| Background | SVG/ICO transparent; `apple-icon.png` **opaque** (iOS composites on white and a transparent one looks broken) |
| Safe area | Design for 16px first. The full wordmark will not survive — use the leaf mark or a single letter |
| Masters | One SVG plus the two derived raster files |
| Budget | Whole set well under 30 KB. Today's single file is 1.06 MB |

### 2. Desktop header logo

| | |
|---|---|
| Source | **SVG preferred.** If raster: **432×288** PNG |
| Aspect | 3:2 (the container is fixed; anything else letterboxes inside `object-contain`) |
| Rendered | 72×48 at ≥1440, 60×40 below |
| Format | SVG, else PNG-24 |
| Background | Transparent |
| Safe area | ~4% padding inside the 3:2 box; it sits next to a 44px nav trigger |
| Masters | One, shared with mobile if the mark reads at 40px — see #3 |
| Min high-DPI | **144×96** (2×). 432×288 is 3× and future-proofs a larger header |

### 3. Mobile compact / round logo

| | |
|---|---|
| Source | **SVG preferred.** If raster: **256×256** PNG |
| Aspect | 1:1 |
| Rendered | ~40×40 |
| Format | SVG, else PNG-24 |
| Background | Transparent |
| Safe area | Circular crop — keep everything inside a centred circle at 88% of the width |
| Masters | **Worth a separate master.** This is the "detailed illustration reads as a smudge at 40px" problem already recorded: the full mark has a leaf emblem, a script wordmark *and* an illustrated figure. At 40px only one element can survive — pick the leaf |
| Min high-DPI | **120×120** (3×, since phones are the 3× devices) |

### 4. Footer logo

| | |
|---|---|
| Source | **SVG preferred.** If raster: **504×336** PNG |
| Aspect | 3:2 |
| Rendered | 84×56 at every breakpoint |
| Format | SVG, else PNG-24 |
| Background | **Transparent, and it must read on white.** It sits in a white chip on the dark green footer — that chip exists because the real mark is a dark-green full-colour illustration that disappears on the footer and turns into a white blob when inverted |
| Safe area | Same as the header |
| Masters | Same master as the header is fine — identical aspect, 17% larger render |
| Min high-DPI | **168×112** (2×) |

### 5. Arabic hero artwork

| | |
|---|---|
| Source | **Two masters.** Desktop/landscape **3200×1800**; mobile/portrait **1600×2000** |
| Aspect | 16:9 desktop; **4:5** mobile |
| Rendered | 1280×1037 → 1921×1037 from `xl`; **383×493 → 552×704 (0.78:1)** below `xl` |
| Format | **JPEG** (photographic, full-bleed, no transparency needed) — today's 1503 KB PNG is the wrong container for this content |
| Background | Opaque |
| Safe area | `object-center` in both treatments. Compose the mobile master **for a 4:5 frame** — it is a panel behind the portrait, not a backdrop for text, so it can carry detail edge to edge. On the desktop master text sits over the artwork, so leave the inline-start 55% quiet |
| Masters | **Two are genuinely needed**, and the mobile one is now a sane asset. The bounded panel holds a steady 0.78:1 from 375 to 1279, so 1600×2000 covers its largest render (552×704) at nearly 3× |
| Min high-DPI | Desktop: 3200×1800 covers 1920 at ~1.6×; true 2× would be 3842×2074, not worth the bytes for a background. Mobile: **1104×1408** is 2× of the largest panel, so 1600×2000 has headroom |

> **Resolved — the bounded treatment is implemented.** Below `xl` the artwork is
> a panel behind the doctor portrait at the portrait's own 4:5 ratio, and the copy
> sits on the plain page ground. Measured before: a 375×1458 box (0.26:1) covered
> from a 2.26:1 source — about an 8.8× upscale showing the middle ~11% of the
> frame. Measured after: 383×493 at 375px, holding 0.78:1 all the way to 1279px,
> and the mobile hero is 245px shorter.
>
> The breakpoint is **`xl` (1280), not `lg` (1024)**, and that was measured too:
> the hero's own box is still portrait at 1024 (0.79:1) and 1120 (0.92:1) and only
> turns landscape at 1280 (1.23:1). Switching to the full-bleed landscape layer at
> `lg` would have reintroduced the same crop across a 256px band.

### 6. English hero artwork

Same numbers as #5 — **but separately composed, not mirrored.**

There is currently no CSS mirroring on the hero at all (no `rtl:-scale-x-100` on
`hero-background.tsx`), so `/ar` and `/en` share one unmirrored image today. Two
compositions are the right call: the Arabic layout puts text on the inline-start
which is the *right* in RTL, so the artwork's quiet zone needs to be on the
opposite side from the English version. Flipping photographic artwork also
mirrors any text, product packaging or the subject's parting, which reads as a
mistake.

| | |
|---|---|
| Masters | Desktop **3200×1800**, mobile **1600×2000** — one pair per locale, four files total. `constant/hero-artwork.ts` is the seam; each entry is a one-line swap |
| Safe area | Quiet zone on the **left 55%** for `/en`; on the **right 55%** for `/ar` |

### 7. Doctor hero portrait

| | |
|---|---|
| Source | **1600×2000** |
| Aspect | **4:5** — this is the box's real ratio; today's 0.57:1 source loses 29% of its height |
| Rendered | 343×429 / 384×480 / 512×640 |
| Format | **JPEG** if the background is photographic; **PNG-24** only if it needs a transparent cut-out |
| Background | Either, but see the safe area |
| Safe area | **The container is `rounded-full` with `aspect-[4/5]`, so the crop is an ellipse, not a rectangle.** Keep the face and shoulders inside a centred ellipse at ~90% of the box, and expect the four corners to be cut entirely |
| Masters | One. The 4:5 box is constant across breakpoints |
| Min high-DPI | **1024×1280** (2× of the 512×640 render). 1600×2000 gives headroom |

### 8. Botanical vector, for the line-draw animation

See the next section — this one needs more than a row in a table.

## The botanical asset, specifically

> ## Audit of the supplied `public/images/leaf.svg` (2026-08-22)
>
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
> | `viewBox` | **missing** (only width/height) | `0 0 1536 1024` |
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
> It is also **larger than the PNG it would replace** — 2.43 MB against 1.41 MB —
> so it is not worth swapping in even as a static decoration.
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
> static decoration. Everything below still describes the target.


**Which artwork:** the **existing footer leaf**, not a new decoration. It is the
established "Botanical Trust" signature element and the only botanical artwork on
the site; introducing a second one would create a second visual language rather
than animate the one that exists. Today it is `public/images/books/footer-leaf.png`,
1536×1024, 1413 KB.

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

## Summary of what to supply

| # | File | Source px | Format |
|---|---|---|---|
| 1 | `icon.svg` + `apple-icon.png` + `favicon.ico` | vector, 180×180, 16/32/48 | SVG + PNG + ICO |
| 2 | Primary logo (header + footer) | vector, or 504×336 | SVG / PNG-24 |
| 3 | Compact round mark | vector, or 256×256 | SVG / PNG-24 |
| 4 | Hero — Arabic, desktop | 3200×1800 | JPEG |
| 5 | Hero — Arabic, mobile | 1600×2000 | JPEG |
| 6 | Hero — English, desktop | 3200×1800 | JPEG |
| 7 | Hero — English, mobile | 1600×2000 | JPEG |
| 8 | Doctor portrait | 1600×2000 | JPEG or PNG-24 |
| 9 | Botanical | `viewBox 0 0 1536 1024`, stroked paths | SVG |

Nine files, or six if the logo serves header, footer and compact mark from one
vector.
