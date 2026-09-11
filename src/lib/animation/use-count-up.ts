"use client";
import { useRef, useState } from "react";
import { animate, inView } from "motion";
import { usePrefersReducedMotion } from "./use-prefers-reduced-motion";
import { DURATIONS, MOTION_EASES } from "./motion-tokens";
import { useIsomorphicLayoutEffect } from "./use-isomorphic-layout-effect";

/** Matches `useScrollReveal`'s trigger point so a stat lands with its neighbours. */
const VIEWPORT_MARGIN = "0px 0px -8% 0px";

export interface UseCountUpResult {
  /** Attach to the element wrapping the figure. */
  ref: React.RefObject<HTMLSpanElement | null>;
  /** The figure to paint right now, already formatted. */
  display: string;
}

/**
 * Layer 6 of `docs/motion-system.md`: a figure counting up to its real value as
 * it enters view, once.
 *
 * **The caller passes a formatter, and every intermediate frame goes through
 * it.** That is the whole reason this takes a function rather than a number and
 * formatting at the end: `Intl.NumberFormat("ar")` resolves to the `arab`
 * numbering system, so an Arabic page renders ١٬٢٥٠ rather than 1,250. Tweening
 * a raw number and formatting only the final value would count in Western
 * digits and then snap to Arabic-Indic at the last frame — which is exactly the
 * failure the motion system calls out by name.
 *
 * `display` is seeded with the formatted final value, so the server-rendered
 * HTML already contains the real figure. The count is an enhancement layered
 * over text that was correct before any JavaScript ran; it never invents the
 * number, and if the tween never starts the page is still right.
 *
 * Under `prefers-reduced-motion` it does not run at all — layer 6 is in the
 * group the motion system says "does not run", not the group that keeps its
 * outcome and loses its transition. Read through `usePrefersReducedMotion` for
 * liveness, since Motion's own `useReducedMotion` snapshots once at mount.
 *
 * Fires once: `inView`'s callback returns nothing, which is what stops it
 * re-observing — the same contract `useScrollReveal` relies on.
 */
export function useCountUp(value: number, format: (n: number) => string): UseCountUpResult {
  const ref = useRef<HTMLSpanElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const [display, setDisplay] = useState(() => format(value));

  /**
   * Held in a ref so the effect below never re-runs because a parent handed
   * down a new function identity — re-running it would replay the count.
   */
  const formatRef = useRef(format);
  formatRef.current = format;

  useIsomorphicLayoutEffect(() => {
    const element = ref.current;
    if (!element || prefersReducedMotion) return;

    /* Tracked out here, not returned from the callback below. Returning
       anything from an `inView` callback registers it as a LEAVE handler, which
       keeps the observer alive and replays the count on every scroll past — the
       same trap `useScrollReveal` documents. The callback must return nothing
       for this to fire once, so the animation is stopped from the effect's own
       cleanup instead. */
    let controls: { stop: () => void } | undefined;

    const stopObserving = inView(
      element,
      () => {
        controls = animate(0, value, {
          duration: DURATIONS.count,
          ease: MOTION_EASES.soft,
          onUpdate: (current) => setDisplay(formatRef.current(current)),
          /* Land exactly on the real value rather than wherever the last frame
             happened to fall. */
          onComplete: () => setDisplay(formatRef.current(value)),
        });
      },
      { margin: VIEWPORT_MARGIN }
    );

    return () => {
      stopObserving();
      controls?.stop();
    };
  }, [value, prefersReducedMotion]);

  return { ref, display };
}
