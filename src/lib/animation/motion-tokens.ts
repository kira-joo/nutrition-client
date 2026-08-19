import raw from "./motion-tokens.json";

/**
 * GSAP hooks/utilities import DURATIONS/EASES from here instead of
 * hardcoding values per call site. `motion-tokens.json` is the one
 * canonical source — this file only reshapes it into GSAP-friendly units
 * (seconds, not ms) and typed constants.
 *
 * The matching CSS custom properties in `src/app/_generated/motion-tokens.css`
 * (imported by `globals.css`) are GENERATED from this exact same JSON file
 * by `scripts/generate-motion-css.mjs`, run automatically via the `predev`/
 * `prebuild` npm lifecycle scripts — there is no hand-maintained CSS copy to
 * drift out of sync. See that script for the generation logic.
 */

const durationsMs = raw.durationsMs;
const eases = raw.eases;

export const DURATIONS = {
  fast: durationsMs.fast / 1000,
  base: durationsMs.base / 1000,
  slow: durationsMs.slow / 1000,
  reveal: durationsMs.reveal / 1000,
} as const;

export const EASES = {
  standard: eases.standard.gsap,
  emphasized: eases.emphasized.gsap,
  inOut: eases.inOut.gsap,
  soft: eases.soft.gsap,
} as const;

/**
 * A third reshape lane alongside GSAP's above and the generated CSS custom
 * properties: Motion's `animate()` takes a cubic-bezier `ease` as a 4-number
 * array, not a CSS string or a GSAP ease name, so this parses the exact same
 * `cssCubicBezier` values already in `motion-tokens.json` rather than
 * hand-copying the numbers a third time. Still one canonical source.
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
} as const;

export type DurationToken = keyof typeof DURATIONS;
export type EaseToken = keyof typeof EASES;
