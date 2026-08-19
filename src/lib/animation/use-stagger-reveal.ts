"use client";
import { useRef } from "react";
import { animate, inView, stagger } from "motion";

/** See `use-scroll-reveal.ts`'s matching type — `inView`'s options interface isn't itself exported by the `motion` package. */
type InViewMargin = NonNullable<Parameters<typeof inView>[2]>["margin"];
import { usePrefersReducedMotion } from "./use-prefers-reduced-motion";
import { DURATIONS, MOTION_EASES, type DurationToken, type EaseToken } from "./motion-tokens";
import { useIsomorphicLayoutEffect } from "./use-isomorphic-layout-effect";
import type { RevealDirection } from "./use-scroll-reveal";

const MOBILE_BREAKPOINT = "(max-width: 767px)";
const MOBILE_DURATION_SCALE = 0.75;
/** See `use-scroll-reveal.ts`'s matching constant for why this isn't a pixel-identical port of the old GSAP ScrollTrigger `start` string. */
const DEFAULT_VIEWPORT_MARGIN = "0px 0px -8% 0px";

export interface UseStaggerRevealOptions {
  direction?: RevealDirection;
  distance?: number;
  duration?: DurationToken;
  ease?: EaseToken;
  /** An IntersectionObserver `margin` value, typed to Motion's own shape — see `use-scroll-reveal.ts`. */
  start?: InViewMargin;
  /** Seconds between each child's start — Motion's own `stagger()`, not a per-child delay prop the caller computes by hand. */
  stagger?: number;
  /** Seconds before the *group* starts (e.g. to land after a sibling block's own reveal) — shifts the whole sequence, not spacing within it. */
  delay?: number;
}

/**
 * `useScrollReveal` for a *group*: one viewport observer on the container,
 * staggering its direct children via Motion's own `stagger()` rather than
 * each child owning an independent observer with a hand-computed
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
  const prefersReducedMotion = usePrefersReducedMotion();
  const {
    direction = "up",
    distance = 32,
    duration = "reveal",
    ease = "emphasized",
    start = DEFAULT_VIEWPORT_MARGIN,
    stagger: staggerGap = 0.08,
    delay = 0,
  } = options;

  useIsomorphicLayoutEffect(() => {
    const container = ref.current;
    if (!container) return;
    const children = Array.from(container.children) as HTMLElement[];
    if (children.length === 0) return;

    if (prefersReducedMotion) {
      animate(children, { opacity: 1, x: 0, y: 0 }, { duration: 0 });
      return;
    }

    const axis: "x" | "y" = direction === "left" || direction === "right" ? "x" : "y";
    const sign = direction === "up" || direction === "left" ? 1 : -1;
    const fromOffset = direction === "none" ? 0 : distance * sign;

    animate(children, { opacity: 0, [axis]: fromOffset }, { duration: 0 });

    const stop = inView(
      container,
      () => {
        const isMobile = window.matchMedia(MOBILE_BREAKPOINT).matches;
        animate(
          children,
          { opacity: 1, [axis]: 0 },
          {
            duration: DURATIONS[duration] * (isMobile ? MOBILE_DURATION_SCALE : 1),
            ease: MOTION_EASES[ease],
            delay: stagger(staggerGap, { startDelay: delay }),
          },
        );
      },
      { margin: start },
    );

    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [direction, distance, duration, ease, start, staggerGap, delay, prefersReducedMotion]);

  return ref;
}
