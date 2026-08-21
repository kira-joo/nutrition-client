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
| Hero artwork box | 375×**1458** | 771×**1390** | 1450×1044 | 1921×1037 | **0.26 → 1.85** | 1885×834 |
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
| Source | **Two masters.** Desktop/landscape **3200×1800**; mobile/portrait **1200×2400** |
| Aspect | 16:9 desktop; 1:2 mobile |
| Rendered | 1450×1044 → 1921×1037 desktop; 375×1458 and 771×1390 below `lg` |
| Format | **JPEG** (photographic, full-bleed, no transparency needed) — today's 1503 KB PNG is the wrong container for this content |
| Background | Opaque |
| Safe area | Cropped `object-top` below `lg` and `object-center` from `lg`. Keep the subject in the **top third** of the mobile master and the **middle** of the desktop master. Text sits over this — leave the inline-start 55% quiet on desktop |
| Masters | **Two are genuinely needed.** The box goes from 0.26:1 to 1.85:1; one master cannot cover both without either an 8.8× upscale or discarding ~89% of the frame |
| Min high-DPI | 3200×1800 covers 1920 at ~1.6×. True 2× would be 3842×2074, which is not worth the bytes for a background |

> **A layout question worth deciding first.** The mobile hero box is 1458px tall
> — about 1.8 screens — because the artwork is the background for the whole
> stacked hero. Even a 1:2 master gets cropped hard into 0.26:1. The alternative
> is to bound the mobile artwork to its own band (say 4:5) with the text on a
> plain ground below, which would make a **1600×2000** mobile master sufficient
> and stop the crop being a compromise. That is a design change, so it is flagged
> rather than assumed.

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
| Masters | Desktop **3200×1800**, mobile **1200×2400** — one pair per locale, four files total |
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
| 5 | Hero — Arabic, mobile | 1200×2400 | JPEG |
| 6 | Hero — English, desktop | 3200×1800 | JPEG |
| 7 | Hero — English, mobile | 1200×2400 | JPEG |
| 8 | Doctor portrait | 1600×2000 | JPEG or PNG-24 |
| 9 | Botanical | `viewBox 0 0 1536 1024`, stroked paths | SVG |

Nine files, or six if the logo serves header, footer and compact mark from one
vector.
