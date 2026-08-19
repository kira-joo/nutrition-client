"use client";
import { useRef } from "react";
import { animate, inView } from "motion";

/** `inView`'s options interface isn't itself exported by the `motion` package — derived from the function's own signature instead of hand-duplicating its `margin` shape. */
type InViewMargin = NonNullable<Parameters<typeof inView>[2]>["margin"];
import { usePrefersReducedMotion } from "./use-prefers-reduced-motion";
import { DURATIONS, MOTION_EASES, type DurationToken, type EaseToken } from "./motion-tokens";
import { useIsomorphicLayoutEffect } from "./use-isomorphic-layout-effect";

/** Below this, a reveal runs at this fraction of its configured duration — a full-length tween reads as sluggish on a phone. */
const MOBILE_BREAKPOINT = "(max-width: 767px)";
const MOBILE_DURATION_SCALE = 0.75;

/**
 * Motion's `inView` takes an IntersectionObserver-style `margin`, not GSAP
 * ScrollTrigger's `"top 92%"` string — this is a close visual equivalent
 * (fires once the element is within the bottom ~8% of the viewport), not a
 * pixel-identical port. No call site ever overrode the old `start` value, so
 * nothing depended on its exact trigger point.
 */
const DEFAULT_VIEWPORT_MARGIN = "0px 0px -8% 0px";

/**
 * Describes where the element starts relative to its resting position —
 * "up" starts below rest and rises into place on reveal, "down" starts
 * above rest and drops, "left" starts to the right and slides left,
 * "right" starts to the left and slides right, "none" is opacity-only.
 */
export type RevealDirection = "up" | "down" | "left" | "right" | "none";

export interface UseScrollRevealOptions {
  direction?: RevealDirection;
  /** Starting offset in pixels. Ignored when `direction: "none"`. */
  distance?: number;
  duration?: DurationToken;
  ease?: EaseToken;
  /** Seconds, for staggering a group of siblings by hand at the call site. */
  delay?: number;
  /**
   * An IntersectionObserver `margin` value (see the module doc comment
   * above) — not a GSAP ScrollTrigger `start` string. Genuinely a
   * different accepted syntax, not just a renamed option, which is why
   * this is typed to Motion's own shape rather than a bare `string`: a
   * GSAP-style value like `"top 92%"` would fail this type today, and
   * would have thrown at runtime under the old looser typing.
   */
  start?: InViewMargin;
}

/**
 * Attach the returned ref to the element that should animate in once it
 * scrolls into view. Fires exactly once per element — the `inView` callback
 * below returns nothing, which is what makes it fire-once rather than
 * re-triggering on every scroll pass in and out (see `inView`'s own docs:
 * only a callback that *returns* a leave-handler keeps observing).
 *
 * Honors `prefers-reduced-motion` via `usePrefersReducedMotion` (not Motion's
 * own `useReducedMotion`, which only snapshots the setting once at mount and
 * never reacts to it changing mid-session — verified against the installed
 * Motion source, which still carries a TODO about adding that):
 * when set, the element is simply shown at its resting state with no
 * animation or viewport observer registered at all.
 */
export function useScrollReveal<T extends HTMLElement>(options: UseScrollRevealOptions = {}) {
  const ref = useRef<T>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const {
    direction = "up",
    distance = 32,
    duration = "reveal",
    ease = "emphasized",
    delay = 0,
    start = DEFAULT_VIEWPORT_MARGIN,
  } = options;

  useIsomorphicLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (prefersReducedMotion) {
      animate(element, { opacity: 1, x: 0, y: 0 }, { duration: 0 });
      return;
    }

    const axis: "x" | "y" = direction === "left" || direction === "right" ? "x" : "y";
    const sign = direction === "up" || direction === "left" ? 1 : -1;
    const fromOffset = direction === "none" ? 0 : distance * sign;

    // Instant, pre-paint set to the starting offset — mirrors the GSAP
    // version's synchronous `gsap.set` so there's no flash of the resting
    // (revealed) state before the viewport observer ever fires.
    animate(element, { opacity: 0, [axis]: fromOffset }, { duration: 0 });

    const stop = inView(
      element,
      () => {
        const isMobile = window.matchMedia(MOBILE_BREAKPOINT).matches;
        animate(
          element,
          { opacity: 1, [axis]: 0 },
          {
            duration: DURATIONS[duration] * (isMobile ? MOBILE_DURATION_SCALE : 1),
            ease: MOTION_EASES[ease],
            delay,
          },
        );
        // No cleanup returned here on purpose — see the doc comment above.
      },
      { margin: start },
    );

    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [direction, distance, duration, ease, delay, start, prefersReducedMotion]);

  return ref;
}
