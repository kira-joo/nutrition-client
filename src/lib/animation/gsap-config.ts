import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * The one place GSAP plugins get registered — imported once, from every
 * hook in this directory, so registration happens exactly once regardless
 * of how many hooks/components end up using ScrollTrigger. `gsap.registerPlugin`
 * is itself idempotent, but centralizing the call is what keeps every hook
 * from needing its own top-of-file registration boilerplate.
 *
 * Guarded for a non-browser environment (SSR) — GSAP's own APIs are safe to
 * import server-side, but registering a DOM-dependent plugin isn't
 * necessary there and this keeps intent explicit.
 */
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);

  // Cairo loads with `display: "swap"` (see the root layout), which
  // reflows every line of text on the page once the real font arrives.
  // Every reveal's ScrollTrigger caches its trigger element's start
  // position at creation time, and `once: true` means a stale position is
  // wrong forever, not just until the next scroll — a single refresh once
  // fonts have actually settled is enough to fix it up.
  document.fonts?.ready?.then(() => ScrollTrigger.refresh());
}

/**
 * The single shared `prefers-reduced-motion` gate every animation hook in
 * this project must check before starting a GSAP tween/timeline/ScrollTrigger
 * — per the approved plan's accessibility requirement, this is one
 * centralized utility, not a per-component media-query check repeated
 * everywhere. Read at call time (not cached at module scope) since a user
 * can toggle the OS setting while the page is open.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export { gsap, ScrollTrigger };
