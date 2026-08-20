/**
 * The engine-neutral `prefers-reduced-motion` read, deliberately not tied to any
 * animation library — it outlived the GSAP config module it used to live in.
 *
 * Read at call time (not cached at module scope) since a user can toggle the OS
 * setting while the page is open. For React components, prefer
 * `usePrefersReducedMotion()`, which additionally re-renders on that change;
 * this plain function is for the cases that genuinely only need a one-shot read
 * (an initial `useState` value, a non-reactive style string).
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
