# Asset size & spec guide

> **Status (2026-08-20): recommendation doc for the redesign, derived from real
> browser measurement against the code on `staging` at the time of writing.**
>
> Every rendered-box number below was read from `getBoundingClientRect()` in a
> live Playwright session against `http://localhost:3001`, at 375/768/1440 CSS
> px, in both `/ar` and `/en`, cross-checked against the five source files this
> doc covers. Where a number is calculated rather than measured (DPR
> multiples, the ambient-drift peak, the practical master-resolution call),
> it's labelled as such. If header/hero/footer markup changes during the
> redesign, re-measure — this doc is tied to today's layout, not a promise
> about tomorrow's.

## How these numbers were produced

Real dev server (`localhost:3001`), real pages (`/`, footer present on every
route), real viewport resizes, real `getBoundingClientRect()` /
`getComputedStyle()` reads on the actual DOM nodes — not estimated from
reading JSX alone. Every table below states its breakpoint and locale.
Screenshots were taken and pixel-inspected (then deleted — not artifacts of
this doc) to verify the logo-legibility claims in §3 directly, not inferred.

The dev server at `:3001` became unreachable (`ERR_CONNECTION_REFUSED`) partway
through this session, after the bulk of the measurement pass had already
completed; per instructions it was not restarted. One secondary figure (the
768px/`ar` hero-wrapper height, isolated from the artwork box) was not
re-confirmed as a result — the artwork box itself _was_ captured at that
breakpoint/locale before the outage, so no asset spec below depends on the
missing figure. Separately, and unrelated to any of the five assets: several
below-the-fold images (review/recipe thumbnails, the footer's decorative
`footer-leaf.png`) intermittently failed to load with the same
`ERR_CONNECTION_REFUSED` during the session. This looks like a transient dev-
server/connection-limit hiccup, not a code bug in the five assets this doc
specs — noted for the record, not investigated further (out of this task's
scope, and nothing here depends on it).

DPR figures throughout assume the two real device-pixel-ratio tiers that
matter in production: **2x** (the vast majority of "Retina" laptop/phone
glass) and **3x** (high-end phones). 1x (DPR 1) is what this browser session
itself measured; 2x/3x are arithmetic (`CSS px × DPR`), not device-measured —
this environment has no way to force a headless browser's real DPR.

---

## 1. Header logo

**Element:** `header img` — `src/components/layout/site-header/site-header.tsx`.

| Breakpoint | Locale | Rendered box (CSS px) | Notes                        |
| ---------- | ------ | --------------------- | ---------------------------- |
| 375        | ar     | 60 × 40               | `h-10`, x mirrors only       |
| 375        | en     | 60 × 40               | identical box                |
| 768        | en     | 60 × 40               | still below `lg`, same token |
| 1440       | ar     | 72 × 48               | `lg:h-12`                    |
| 1440       | en     | 72 × 48               | identical box                |

Height is fixed by the `h-10 lg:h-12` tokens; width is `object-contain`
auto-derived from the asset's own aspect ratio (measured: 40×1.5=60,
48×1.5=72 — exact match to the real CMS asset's 1.5:1 ratio, confirmed below).
Identical in `/ar` and `/en` — only the x-position mirrors.

| Spec                           | Recommendation                                                                                                                                                                               |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Rendered size in UI            | 60×40 CSS px (<1024px), 72×48 CSS px (≥1024px) — unchanged, keep the `h-10 lg:h-12` tokens                                                                                                   |
| Aspect ratio                   | **3:2 (1.5:1)** — see §3, this is the load-bearing decision                                                                                                                                  |
| Source upload dimensions       | 900×600 px minimum (3:2). The real CMS asset today is 612×408 — already close; round up for headroom                                                                                         |
| Minimum resolution (Retina)    | 2x: 144×96 · 3x: 216×144 (calculated, DPR×72×48). 612×408 clears 3x with ~2.8× margin — **resolution is not this asset's problem**                                                           |
| Format                         | PNG-24 with alpha. The mark sits on a transparent hero background at the top of the page and needs to survive over photography/artwork, not just a flat chip                                 |
| Safe crop / `object-position`  | None needed — `object-contain`, whole file always shown uncropped. Keep the artwork's own canvas margin small (≈5% per side); `object-contain` doesn't trim a file's own internal whitespace |
| Separate mobile/desktop asset? | **No.** One master, scaled by CSS height (40→48px) via `object-contain`. A device-specific swap would add a request and a CMS field for an 8px difference                                    |

## 2. Footer logo

**Element:** the `<img>` with a non-empty `alt` inside the chip
(`span.inline-flex`) in `footer.bg-surface-inverse` —
`src/components/layout/site-footer/site-footer.tsx`.

| Breakpoint | Locale | Rendered box (CSS px) | Notes                         |
| ---------- | ------ | --------------------- | ----------------------------- |
| 375        | ar     | 84 × 56               | `h-14`, no responsive variant |
| 375        | en     | 84 × 56               | identical                     |
| 768        | ar     | 84 × 56               | identical                     |
| 768        | en     | 84 × 56               | identical                     |
| 1440       | ar     | 84 × 56               | identical                     |
| 1440       | en     | 84 × 56               | identical                     |

Constant at **every** breakpoint and locale — `h-14` has no `lg:` variant, so
unlike the header this never scales up on desktop.

| Spec                           | Recommendation                                                                                                                                                                                                                                                                 |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Rendered size in UI            | 84×56 CSS px, constant across all breakpoints                                                                                                                                                                                                                                  |
| Aspect ratio                   | 3:2 (1.5:1) — same asset as the header, see §3                                                                                                                                                                                                                                 |
| Source upload dimensions       | Same master as the header (900×600). Do not maintain a second "footer logo" file                                                                                                                                                                                               |
| Minimum resolution (Retina)    | 2x: 168×112 · 3x: 252×168 (calculated). The real 612×408 asset clears 3x with ~2.4× margin                                                                                                                                                                                     |
| Format                         | Same PNG-24 alpha master. The light chip (`bg-surface` on the dark inverse footer) already solves the "detailed asset needs its own colours, not an inverted silhouette" problem documented inline in `site-footer.tsx` — keep the chip, don't reach for `brightness-0 invert` |
| Safe crop / `object-position`  | None — `object-contain` in a padded chip                                                                                                                                                                                                                                       |
| Separate mobile/desktop asset? | **No.** Same conclusion as the header, and here the box doesn't even change size across breakpoints                                                                                                                                                                            |

## 3. The logo aspect-ratio conflict — and what to do about it

Two shapes are live in this codebase right now, and they are not
interchangeable:

| Asset                                         | Native size                                                                | Ratio      | Content                                                                                                   |
| --------------------------------------------- | -------------------------------------------------------------------------- | ---------- | --------------------------------------------------------------------------------------------------------- |
| Real CMS logo (Cloudinary, current)           | 612×408 (independently confirmed by loading the live asset URL in-browser) | **1.5:1**  | Full-colour illustration: circular leaf emblem + script "Dr. Omnia" wordmark + a small illustrated figure |
| Bundled fallback `/public/images/TopLogo.png` | 2000×550                                                                   | **3.64:1** | Flat wordmark only                                                                                        |

At the _same rendered height_, the fallback renders roughly **2.4× wider**
than the real asset (e.g. at `h-12`/48px: real asset ≈72px wide, fallback
≈175px wide). The code already defends against this in two places — a
per-branch `sizes` hint in the footer (`"96px"` real / `"208px"` fallback,
because "one shared value would over-fetch for one of them") and a comment
recording that inverting the fallback's flat silhouette used to be fine but
flattened the real illustration's figure into "a featureless white blob."
Both comments describe _symptoms already hit in production_ — this is a
proven recurring failure mode, not a hypothetical.

**Recommendation: standardize the CMS logo field on 3:2 (1.5:1) going
forward**, matching the real asset already in use, and treat 3.64:1 uploads
as non-conforming. Never let a re-upload reintroduce the fallback's shape.

**Legibility, verified in-browser, not assumed:** a header/footer render this
small (60–84px wide) cannot carry a detailed illustration. Screenshots taken
at both the header's 1440px desktop size (72×48) and the footer's chip size
(84×56), cropped and pixel-inspected:

- The circular leaf emblem reads at both sizes.
- The script wordmark is a blurred, illegible smear at both sizes.
- The small illustrated figure is an unrecognizable dark blob at both sizes.

This means **the header logo currently fails at its one job** — it is meant
to be the primary clinic identifier in the nav, and today only a leaf-shaped
smudge survives the render. This is a real, measured problem, not a
theoretical one; the fix is design work, not a CSS tweak.

**Recommendation: commission a second, simplified lockup** for small-size use
(header, footer, favicon, any future avatar-scale placement):

- Drop the illustrated figure entirely at this scale — it never survives.
- Keep the leaf emblem; consider pairing it with a short, heavier-weight
  wordmark (or no wordmark below ~48px — the emblem alone, with the clinic
  name carried by adjacent text/`alt`, is more honest than an illegible one).
- Target the same 1.5:1 ratio so it drops into the existing box unchanged.
- Format: **SVG** if the emblem can be redrawn as flat vector shapes (it's
  simple enough — a circle, a leaf, a few strokes) — crisp at every DPR, a
  few KB. Fall back to PNG-24 alpha only if a vector redraw isn't available.
- Reserve the full detailed illustration (current asset) for large-format
  placements where it actually clears legibility — an About page, print,
  social — never for a ≤56px-tall UI chip again.

This is a design/judgement recommendation, not a measurement — the specific
redrawn mark doesn't exist yet.

## 4. Hero background artwork

**Elements:** `src/sections/home/hero-background.tsx` — wrapper (`overflow-
hidden`, clips), parallax layer (`top/bottom: -10%`, the overscan), drift
layer (ambient `scale` animation), then the `<Image fill>` itself
(`/images/heroSection.png`, native 1885×834, ratio **2.26:1**).

### Measured boxes

| Breakpoint | Locale | Hero content box ("wrapper", CSS px)     | Rendered `<img>` box at capture (CSS px) | `object-position`  |
| ---------- | ------ | ---------------------------------------- | ---------------------------------------- | ------------------ |
| 375        | ar     | 375 × 1213.3                             | 391.1 × 1518.6                           | `50% 0%` (top)     |
| 375        | en     | 375 × 1240.3                             | 387.9 × 1539.6                           | `50% 0%` (top)     |
| 768        | en     | 768 × 1075.6                             | 774.2 × 1301.2                           | `50% 0%` (top)     |
| 768        | ar     | _(not isolated — see outage note above)_ | 792.1 × 1428.6                           | `50% 0%` (top)     |
| 1440       | ar     | 1440 × 864                               | 1447.7 × 1042.4                          | `50% 50%` (center) |
| 1440       | en     | 1440 × 864                               | 1465.9 × 1055.4                          | `50% 50%` (center) |

`object-position` flip (`object-top` → `lg:object-center`) confirmed live at
exactly the `lg` breakpoint, matching the class.

**Locale symmetry:** the artwork is used **unflipped** in both directions —
correct by design (see the doc-comment in `hero-section.tsx`: the two-zone
composition has a real zone on each side, so the grid's own direction-aware
column order lands the doctor in the correct zone without mirroring the
image). The rendered box is _nearly_ but not exactly identical between
locales: at 1440 it's byte-identical (864 wrapper height both locales — the
doctor-image column dominates height there), but at 375 there's a ~2.2%
difference (1213.3 vs 1240.3) because Arabic and English copy wrap to
different heights in the single-column mobile layout. This is a copy-length
side effect, not a locale-specific crop rule — no separate art asset needed.

### Why the container size understates the required resolution

Read directly from `hero-background.tsx`, then confirmed live:

1. **Layout overscan.** `PARALLAX_OVERSCAN_PERCENT = 10` (top and bottom),
   applied via inline `style` on the parallax layer, unconditionally at every
   breakpoint. Cross-checked via `getComputedStyle` at 1440: wrapper height
   864 → parallax layer height **1036.8 = 864 × 1.2 exactly.** This exists to
   hide the artwork's edge during the desktop-only scroll parallax, but the
   overscanned box is rendered at every breakpoint regardless — mobile pays
   for it in on-screen pixels even though it never runs the scroll effect
   that needed it.
2. **Ambient drift, compounding on top of that.** `DRIFT_SCALE = 1.045` — a
   continuous, infinite `scale` breathe on the _inner_ layer, gated only by
   `prefers-reduced-motion`, running at every breakpoint (unlike the scroll
   parallax, which is desktop-only). Confirmed live, not just read from
   source: the same 1440 measurement caught the drift layer at
   1457.47×1049.38 against its 1440×1036.8 base — a live scale factor of
   **1.0121×** at that exact instant, proving the transform is actually
   animating at runtime. Because it's a continuous infinite loop, a one-shot
   snapshot can't reliably catch its _peak_ — the 1.045 peak below is the
   code constant, not a directly observed extremum.

Combined worst case, relative to the hero's own CSS content box:
**width ×1.045, height ×1.2 × 1.045 = ×1.254.**

| Breakpoint | Locale                | Wrapper (CSS px) | Peak incl. overscan + drift (calculated) |
| ---------- | --------------------- | ---------------- | ---------------------------------------- |
| 375        | en (tallest measured) | 375 × 1240.3     | 392 × 1555                               |
| 768        | en                    | 768 × 1075.6     | 803 × 1349                               |
| 1440       | ar/en                 | 1440 × 864       | 1505 × 1083                              |

**Retina minimums on the peak column** (calculated, DPR×):

| Breakpoint | 2x          | 3x          |
| ---------- | ----------- | ----------- |
| 375        | 784 × 3110  | 1176 × 4666 |
| 768        | 1606 × 2698 | 2409 × 4047 |
| 1440       | 3010 × 2166 | 4514 × 3249 |

**A real finding, not a hypothetical:** because the artwork's native ratio
(2.26:1) is much wider/shorter than any of these boxes (all of them are
height-dominant once overscan is included), `object-cover`'s covering scale
is **always height-bound** here — confirmed by the arithmetic at every
breakpoint (e.g. at 1440: `max(1505/1885, 1083/834) = max(0.80, 1.30) =
1.30`, height-bound). That means **today's live 1885×834 asset is already
being upscaled on screen** — at the mobile peak, the implied covering scale
is roughly **1.9×** (1555 ÷ 834 ≈ 1.86, before even adding DPR). This is
present softness on mobile today, not a future risk.

Because the scale is always height-bound, width takes care of itself once
height is covered (the resulting crop is always wide enough) — **the master
only needs to satisfy one number: height ≥ the tallest breakpoint's peak ×
target DPR.** Width then follows from whatever working aspect ratio the
artwork keeps.

| Spec                           | Recommendation                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Rendered size in UI            | Varies by breakpoint/locale — see measured table; nothing to change here                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| Aspect ratio                   | Keep the existing composition's ~2.26:1 (or whatever ratio the redesign's new artwork needs) — not a fixed requirement, but width will always be generous once height is sized correctly (see above)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Source upload dimensions       | **Practical judgement call:** target the desktop peak at 2x (height ≥ ~2200px, comfortably clears 2166) rather than the mobile 3x extreme (~4666px). Reasoning: at ≥1024px the two-zone composition is genuinely visible and detail matters; below `lg`, `object-top` shows only the artwork's plain top band/leaf texture (per the code's own comment), where the extra softness from an even taller ideal source is far less perceptible. A rigorous mobile-3x spec would ask for ~4670px tall — defensible, but likely not worth the file weight for a background layer. If sharper mobile rendering matters more than file size for this build, size to the 4670px figure instead; that's a product call, not a technical one |
| Format                         | Upload a high-quality **PNG or lossless-ish source** (no transparency needed — it's a full-bleed background). `next.config.mjs` already declares `formats: ["image/avif", "image/webp"]`, so Next transcodes to AVIF-first/WebP automatically at request time — never hand-produce WebP/AVIF derivatives yourself                                                                                                                                                                                                                                                                                                                                                                                                                 |
| Safe crop / `object-position`  | Keep both empty "zones" (for the doctor photo / for the copy) inside the artwork's _horizontal center band_, since `object-top` on mobile crops to the top of the source and `object-center` on desktop crops centered — anything meant to be visible at both breakpoints must sit within the vertical band that both crops share                                                                                                                                                                                                                                                                                                                                                                                                 |
| Separate mobile/desktop asset? | **No — same conclusion as the logo.** One master, `sizes="100vw"`, Next's own responsive `srcset` downscales for smaller viewports automatically. A device-specific swap only makes sense if the _composition itself_ needs to differ, which today's single artwork already handles via `object-position` breakpoints, not a second file                                                                                                                                                                                                                                                                                                                                                                                          |

## 5. Doctor portrait (hero)

**Element:** `<Image fill>` inside the `aspect-[4/5] rounded-full` wrapper,
second grid column — `src/sections/home/hero-section.tsx`.

| Breakpoint | Locale            | Rendered box (CSS px) | `object-position` |
| ---------- | ----------------- | --------------------- | ----------------- |
| 375        | ar/en (identical) | 343 × 428.8           | `50% 0%` (top)    |
| 768        | ar/en (identical) | 384 × 480             | `50% 0%` (top)    |
| 1440       | ar/en (identical) | 512 × 640             | `50% 0%` (top)    |

Byte-identical box and crop between locales at every breakpoint — only the
horizontal position mirrors as the grid column swaps sides. Aspect ratio
holds exactly at 4:5 (0.8) at every size, matching the `aspect-[4/5]` class.

**The mask is an ellipse, not a true circle — confirmed via
`getComputedStyle`.** `rounded-full` resolves to `border-radius: 9999px`,
which CSS clamps per-axis to half of each dimension on a non-square box. On
the 4:5 box this always produces an ellipse with horizontal semi-axis =
50% of the box width and vertical semi-axis = 50% of the box height (at
1440: 256×320) — confirmed by reading the computed style directly, not
assumed from the class name. Because both axes saturate simultaneously (a
mathematical property of any box whose radius request exceeds both half-
dimensions), this holds at every measured breakpoint, not just the one
checked.

**What that mask discards, verified against a real screenshot:** the ellipse
touches the middle of every edge and cuts all four corners aggressively —
much more corner loss than a circle-in-a-square. In the captured 1440
render, the subject's eyes sit at roughly 46% down from the top of the 4:5
box, comfortably inside the ellipse; the white coat/shoulders are visibly
clipped at the bottom-left/bottom-right as the ellipse narrows toward the
bottom-center point.

| Spec                           | Recommendation                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Rendered size in UI            | 343×429 (375px) / 384×480 (768px) / 512×640 (1440px+, `max-w-lg`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| Aspect ratio                   | **4:5**, fixed — matches `aspect-[4/5]` exactly at every breakpoint                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| Source upload dimensions       | **1600×2000 (4:5)** — clears the largest breakpoint (512×640) at 3x with margin, and holds a straightforward crop ratio for whoever prepares the photo                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Minimum resolution (Retina)    | Binding case is 1440px: 2x → 1024×1280, **3x → 1536×1920.** Faces are high-scrutiny content — hold the full 3x bar here, unlike the decorative hero artwork                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Format                         | High-quality JPEG or PNG source (no transparency needed). Same automatic AVIF/WebP negotiation via `next.config.mjs` applies                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Safe crop / `object-position`  | `object-top` at every breakpoint: crop anchors to the **top** of the source, so headroom above the hair should be modest, not generous — extra headroom just gets pushed further from center and is more likely to fall in a corner the ellipse discards. Concretely: keep eyes/nose in the vertical band **25–45% down from the top of the 4:5 frame**, horizontally within **±30% of center** at that band. Never place a second subject, hands, or any essential detail in the four corners (0–15% from any edge pair) — the ellipse mask removes them entirely. A small amount of shoulder/torso below center is fine and expected to be softly clipped at the very bottom corners; that's the mask working as designed, not a cropping mistake |
| Separate mobile/desktop asset? | **No.** Identical crop math and `object-position` at every breakpoint — only the box scales, not the composition. One master photo, cropped once, covers all three sizes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |

---

## How to verify a new upload

After replacing any of the five assets above, in a real browser at 375/768/1440,
in both `/ar` and `/en`:

1. **Rendered box unchanged.** `getBoundingClientRect()` on the element (or
   just eyeball against the tables above) — the new asset should not have
   shifted the CSS box size. If it has, something about its intrinsic
   dimensions or the surrounding flex/grid changed unexpectedly.
2. **No layout shift / no overlap.** Header: does the logo's new rendered
   width crowd the mobile "Book a consultation" button or the desktop nav?
   (This is exactly the failure mode a 3.64:1-ratio upload causes — see §3.)
3. **Legibility at actual render size.** Screenshot the element at its real
   CSS size (not the full-resolution source) and zoom in — don't judge
   legibility from the source file in an image viewer, judge it from a
   screenshot of the live page. This is how the header/footer illegibility
   in §3 was actually confirmed.
4. **Crop sanity for the doctor portrait / hero artwork.** Confirm the
   subject (face, or the artwork's two content zones) survives the `object-
position` + ellipse/rectangle mask at all three breakpoints — check the
   corners specifically for the portrait, and check both `object-top` (mobile
   /tablet) and `object-center` (desktop) crops for the hero artwork.
5. **RTL parity.** Same checks in `/ar` — box size and crop should match
   `/en` (mirrored position only); if they don't, the new asset or its
   container picked up an unwanted direction-dependent style.
6. **Sharpness at 2x/3x.** Resize the browser or use device emulation to
   force a DPR of 2 and 3 (or just inspect the delivered `srcset`/`currentSrc`
   in dev tools) and confirm no candidate is being upscaled past its native
   resolution — Chrome DevTools' Network panel shows the actual delivered
   pixel dimensions per request.
7. **Format negotiation still works.** Confirm the Network panel shows an
   `avif` or `webp` response for the request (per `next.config.mjs`'s
   `formats` list), not a raw un-transcoded upload.
