"use client";
import Image from "next/image";
import { useRef } from "react";
import { animate, scroll } from "motion";
import { AMBIENT, MOTION_EASES } from "@/lib/animation/motion-tokens";
import { useIsomorphicLayoutEffect } from "@/lib/animation/use-isomorphic-layout-effect";
import { usePrefersReducedMotion } from "@/lib/animation/use-prefers-reduced-motion";

const DESKTOP_QUERY = "(min-width: 1024px)";
/** Ambient breathe amplitude — small enough that it reads as "alive" rather than as a tracked movement (see docs/motion-system.md, layer 2). */
const DRIFT_SCALE = 1.045;
/** Scroll-linked travel, as a share of the element's own height. */
const PARALLAX_TRAVEL_PERCENT = 6;
/**
 * The parallax layer is grown beyond the clipping wrapper by more than it
 * ever travels, so translating it can never pull its own edge into view.
 * Without this the artwork's top edge was genuinely visible as a hard line
 * with page background above it — measured at 24px un-covered at rest,
 * growing to 50px by the end of the scroll range, and confirmed on screen.
 * The drift's scale (2.25% per side at most) is nowhere near enough to
 * cover a 6% translation, so the cover has to come from layout. Derived
 * from the travel rather than hardcoded so the two cannot drift apart, and
 * expressed as geometry (not a transform) precisely because a static
 * transform here would be overwritten by the animated one.
 *
 * The margin is `+4` rather than `+2` because the two percentages are of
 * different boxes: the travel is a share of the *grown* layer, the overscan
 * a share of the wrapper, so growing the layer also grows the travel. At
 * `+2` the remaining cover measured only ~11px at the end of the range —
 * correct, but close enough to zero that any future change to either value
 * would silently reopen the bug.
 */
const PARALLAX_OVERSCAN_PERCENT = PARALLAX_TRAVEL_PERCENT + 4;

/**
 * The real `heroSection.png` artwork as the hero's actual background —
 * never recreated with CSS gradients/shapes. Split out of `HeroSection`
 * (an async Server Component) because both motions need refs + effects.
 *
 * Two motions from two different layers of the motion system, and they are
 * deliberately on **two separate elements**: the ambient breathe owns the
 * inner element's `transform`, the scroll-linked parallax owns the outer
 * one's. Stacking both onto a single element is the one genuinely dangerous
 * pattern here — an infinite `scale` loop and a scroll-bound `y` writing the
 * same `transform` fight over it, and the artwork's crop makes the resulting
 * drift obvious. Nesting composes them through the DOM instead, which the
 * browser resolves correctly by construction. Progress measurement stays
 * correct here because the measured target is `wrapper`, which is never
 * animated, and its two animated descendants cannot affect its layout
 * geometry — not because scroll progress is immune to transforms in
 * general. Keep the target itself untransformed if this is restructured.
 *
 * `object-position` is cropped differently per breakpoint: the artwork's
 * two empty content zones sit side by side (built for a wide viewport), so
 * a narrow viewport instead gets a top-anchored crop that keeps the top
 * leaf clusters and the artwork's plain center band as its backdrop.
 */
export function HeroBackground() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);
  const driftRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useIsomorphicLayoutEffect(() => {
    const wrapper = wrapperRef.current;
    const parallaxElement = parallaxRef.current;
    const driftElement = driftRef.current;
    if (!wrapper || !parallaxElement || !driftElement) return;

    if (prefersReducedMotion) return;

    const drift = animate(
      driftElement,
      { scale: [1, DRIFT_SCALE] },
      { duration: AMBIENT.drift, ease: MOTION_EASES.ambient, repeat: Infinity, repeatType: "reverse" },
    );

    // Desktop-only: the effect depends on viewport height the phone layout
    // doesn't have. Subscribed rather than read once, so crossing the
    // breakpoint (or rotating a tablet) starts/stops it instead of leaving
    // a stale decision in place -- this is what gsap.matchMedia did for us.
    let cancelParallax: (() => void) | undefined;
    const desktop = window.matchMedia(DESKTOP_QUERY);

    const syncParallax = () => {
      if (desktop.matches && !cancelParallax) {
        const parallax = animate(parallaxElement, { y: ["0%", `${PARALLAX_TRAVEL_PERCENT}%`] }, { ease: "linear" });
        // Matches the retired ScrollTrigger range exactly: `start: "top bottom"`
        // is the target's start meeting the container's end, and
        // `end: "bottom top"` is its end meeting the container's start.
        const cancelScroll = scroll(parallax, { target: wrapper, offset: ["start end", "end start"] });
        cancelParallax = () => {
          cancelScroll();
          parallax.stop();
          parallaxElement.style.transform = "";
        };
      } else if (!desktop.matches && cancelParallax) {
        cancelParallax();
        cancelParallax = undefined;
      }
    };

    syncParallax();
    desktop.addEventListener("change", syncParallax);

    return () => {
      desktop.removeEventListener("change", syncParallax);
      cancelParallax?.();
      drift.stop();
      driftElement.style.transform = "";
    };
  }, [prefersReducedMotion]);

  return (
    <div ref={wrapperRef} className="absolute inset-0 overflow-hidden">
      <div
        ref={parallaxRef}
        className="absolute inset-x-0"
        style={{ top: `-${PARALLAX_OVERSCAN_PERCENT}%`, bottom: `-${PARALLAX_OVERSCAN_PERCENT}%` }}
      >
        <div ref={driftRef} className="absolute inset-0">
          <Image src="/images/heroSection.png" alt="" fill priority sizes="100vw" className="object-cover object-top lg:object-center" />
        </div>
      </div>
    </div>
  );
}
