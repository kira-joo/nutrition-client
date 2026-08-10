"use client";
import { useRef } from "react";
import { gsap, prefersReducedMotion } from "./gsap-config";
import { DURATIONS, EASES, type DurationToken, type EaseToken } from "./motion-tokens";
import { useIsomorphicLayoutEffect } from "./use-isomorphic-layout-effect";
import type { RevealDirection } from "./use-scroll-reveal";

const MOBILE_BREAKPOINT = "(max-width: 767px)";
const MOBILE_DURATION_SCALE = 0.75;

export interface UseStaggerRevealOptions {
  direction?: RevealDirection;
  distance?: number;
  duration?: DurationToken;
  ease?: EaseToken;
  start?: string;
  /** Seconds between each child's start — GSAP's own `stagger`, not a per-child delay prop the caller computes by hand. */
  stagger?: number;
  /** Seconds before the *group* starts (e.g. to land after a sibling block's own reveal) — shifts the whole sequence, not spacing within it. */
  delay?: number;
}

/**
 * `useScrollReveal` for a *group*: one ScrollTrigger on the container,
 * staggering its direct children via GSAP's own `stagger` rather than
 * each child owning an independent trigger with a hand-computed
 * `delay={index * 0.08}`. That per-item pattern is pure additive latency
 * on a single-column mobile layout — every card already has its own
 * trigger, so by the time card 4 scrolls into view it's already been
 * sitting there for 3 * 0.08s before its own reveal even starts, on top
 * of the reveal's own duration. A shared trigger fires once, and the
 * stagger only paces the already-visible group's entrance.
 *
 * Attach the returned ref to the container; reveals whichever elements
 * are its immediate children at the time this runs, so the container
 * should render its final child list on first paint (true for every
 * current call site — server-rendered lists, not client-appended ones).
 */
export function useStaggerReveal<T extends HTMLElement>(options: UseStaggerRevealOptions = {}) {
  const ref = useRef<T>(null);
  const {
    direction = "up",
    distance = 32,
    duration = "reveal",
    ease = "emphasized",
    start = "top 92%",
    stagger = 0.08,
    delay = 0,
  } = options;

  useIsomorphicLayoutEffect(() => {
    const container = ref.current;
    if (!container) return;
    const children = Array.from(container.children) as HTMLElement[];
    if (children.length === 0) return;

    if (prefersReducedMotion()) {
      gsap.set(children, { opacity: 1, x: 0, y: 0 });
      return;
    }

    const axis: "x" | "y" = direction === "left" || direction === "right" ? "x" : "y";
    const sign = direction === "up" || direction === "left" ? 1 : -1;
    const fromOffset = direction === "none" ? 0 : distance * sign;

    const ctx = gsap.context(() => {
      const animate = (durationScale: number) =>
        gsap.fromTo(
          children,
          { opacity: 0, [axis]: fromOffset },
          {
            opacity: 1,
            [axis]: 0,
            duration: DURATIONS[duration] * durationScale,
            ease: EASES[ease],
            delay,
            stagger,
            scrollTrigger: { trigger: container, start, once: true },
          },
        );

      const mm = gsap.matchMedia();
      mm.add(MOBILE_BREAKPOINT, () => animate(MOBILE_DURATION_SCALE));
      mm.add(`(min-width: 768px)`, () => animate(1));
    }, container);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [direction, distance, duration, ease, start, stagger, delay]);

  return ref;
}
