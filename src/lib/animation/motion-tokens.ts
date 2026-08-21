import raw from "./motion-tokens.json";

/**
 * `motion-tokens.json` is the one canonical source for every duration and
 * ease in the app. This module reshapes it for Motion's JS API: seconds
 * rather than milliseconds, and cubic-bezier arrays rather than CSS strings.
 *
 * The matching CSS custom properties in `src/app/_generated/motion-tokens.css`
 * (imported by `globals.css`) are GENERATED from that same JSON by
 * `scripts/generate-motion-css.mjs`, run automatically via the `predev`/
 * `prebuild` npm lifecycle scripts — there is no hand-maintained CSS copy to
 * drift out of sync. See that script for the generation logic.
 */

const durationsMs = raw.durationsMs;
const ambientMs = raw.ambientMs;
const intervalsMs = raw.intervalsMs;
const eases = raw.eases;

export const DURATIONS = {
  fast: durationsMs.fast / 1000,
  base: durationsMs.base / 1000,
  slow: durationsMs.slow / 1000,
  reveal: durationsMs.reveal / 1000,
} as const;

/**
 * Continuous/decorative motion lives on its own much longer timescale than
 * the triggered tokens above (all sub-second) — `drift` is the ambient hero
 * breathe. Kept a separate scale rather than stretched onto the interactive
 * one, which would make both harder to reason about. See
 * docs/motion-system.md for which layer owns which scale.
 */
export const AMBIENT = {
  drift: ambientMs.drift / 1000,
} as const;

/**
 * Motion's `animate()` takes a cubic-bezier `ease` as a 4-number array, not
 * a CSS string, so this parses the same `cssCubicBezier` values the
 * generated CSS uses rather than hand-copying the numbers a second time.
 */
function parseCubicBezier(css: string): [number, number, number, number] {
  const match = css.match(/cubic-bezier\(([^)]+)\)/);
  if (!match) throw new Error(`Not a cubic-bezier() string: ${css}`);
  const [x1, y1, x2, y2] = match[1].split(",").map(Number);
  return [x1, y1, x2, y2];
}

export const MOTION_EASES = {
  standard: parseCubicBezier(eases.standard.cssCubicBezier),
  emphasized: parseCubicBezier(eases.emphasized.cssCubicBezier),
  inOut: parseCubicBezier(eases.inOut.cssCubicBezier),
  soft: parseCubicBezier(eases.soft.cssCubicBezier),
  ambient: parseCubicBezier(eases.ambient.cssCubicBezier),
} as const;

/**
 * Cadences, not animations — how long a thing *rests* before the next one, as
 * opposed to how long a transition takes. Kept in milliseconds because their
 * only consumers are timer APIs, and deliberately separate from `DURATIONS`
 * (sub-second transitions) and `AMBIENT` (tens-of-seconds decorative loops),
 * which is the distinction `docs/motion-system.md` draws between layers.
 *
 * `slideDwell` is how long the featured-reviews carousel holds a slide. Six
 * seconds is long enough to read a short testimonial without re-reading, and
 * short enough that the strip reads as alive.
 */
export const INTERVALS_MS = {
  slideDwell: intervalsMs.slideDwell,
} as const;

export type DurationToken = keyof typeof DURATIONS;
export type EaseToken = keyof typeof MOTION_EASES;
