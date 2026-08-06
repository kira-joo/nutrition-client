"use client";
import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "./gsap-config";
import { DURATIONS, EASES, type DurationToken, type EaseToken } from "./motion-tokens";

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
  /** A ScrollTrigger `start` value — how far into the viewport before the reveal fires. */
  start?: string;
}

/**
 * Attach the returned ref to the element that should animate in once it
 * scrolls into view. Fires exactly once per element (`once: true` on the
 * underlying ScrollTrigger) — this project's replacement for the legacy
 * `framer-motion`-based `AnimatedSection`, which re-triggered on every
 * repeat scroll pass; that's a real, deliberately-fixed behavior
 * difference, not an oversight.
 *
 * Honors the shared `prefers-reduced-motion` gate (`gsap-config.ts`): when
 * set, the element is simply shown at its resting state with no animation
 * or ScrollTrigger registered at all.
 */
export function useScrollReveal<T extends HTMLElement>(options: UseScrollRevealOptions = {}) {
  const ref = useRef<T>(null);
  const { direction = "up", distance = 32, duration = "reveal", ease = "emphasized", delay = 0, start = "top 85%" } = options;

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (prefersReducedMotion()) {
      gsap.set(element, { opacity: 1, x: 0, y: 0 });
      return;
    }

    const axis: "x" | "y" = direction === "left" || direction === "right" ? "x" : "y";
    const sign = direction === "up" || direction === "left" ? 1 : -1;
    const fromOffset = direction === "none" ? 0 : distance * sign;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        element,
        { opacity: 0, [axis]: fromOffset },
        {
          opacity: 1,
          [axis]: 0,
          duration: DURATIONS[duration],
          ease: EASES[ease],
          delay,
          scrollTrigger: {
            trigger: element,
            start,
            once: true,
          },
        }
      );
    });

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [direction, distance, duration, ease, delay, start]);

  return ref;
}
