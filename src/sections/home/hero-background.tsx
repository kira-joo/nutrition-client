"use client";
import Image from "next/image";
import { useRef } from "react";
import { animate, scroll } from "motion";
import { AMBIENT, MOTION_EASES } from "@/lib/animation/motion-tokens";
import { useIsomorphicLayoutEffect } from "@/lib/animation/use-isomorphic-layout-effect";
import { usePrefersReducedMotion } from "@/lib/animation/use-prefers-reduced-motion";

/**
 * 1280, not 1024. Measured: the hero's own box is still portrait at `lg` — 0.79:1
 * at 1024 and 0.92:1 at 1120 — and only turns landscape at 1280 (1.23:1). A
 * landscape master covering a portrait box is the crop this whole recomposition
 * exists to remove, so the full-bleed layer starts where the box can actually
 * hold it and the bounded panel covers everything below.
 */
const DESKTOP_QUERY = "(min-width: 1280px)";
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
 *
 * The trade-off this used to carry — that the overscan grew the layer at every
 * breakpoint while only desktop had the parallax needing it — is gone, because
 * the whole background is now `xl`-only. Below `xl` the hero uses a bounded
 * artwork panel instead (see `HeroSection`), so there is no full-bleed layer to
 * overscan and no height-bound `object-cover` inflating what the phone has to
 * download.
 */
const PARALLAX_OVERSCAN_PERCENT = PARALLAX_TRAVEL_PERCENT + 4;

/**
 * The real supplied artwork (`constant/hero-artwork.ts`) as the hero's
 * actual background — never recreated with CSS gradients/shapes. Split out
 * of `HeroSection` (an async Server Component) because both motions need
 * refs + effects.
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
 * `object-center`, not a directional crop: this layer only renders from
 * `xl` up (the bounded panel below that has its own `HeroSection` markup),
 * and the supplied artwork is a symmetric botanical border around a quiet
 * centre — see `constant/hero-artwork.ts` for the measurement — so a single
 * centred crop is correct at every desktop width this layer is visible at.
 */
export interface HeroBackgroundProps {
  /** The locale's landscape master — see `constant/hero-artwork.ts`. */
  src: string;
}

export function HeroBackground({ src }: HeroBackgroundProps) {
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

    // Both motions are desktop-only now, because the element they animate is
    // `hidden` below `xl` — an infinite drift loop on a `display: none` layer is
    // pure wasted frames. Subscribed rather than read once, so crossing the
    // breakpoint (or rotating a tablet) starts/stops them instead of leaving a
    // stale decision in place -- this is what gsap.matchMedia did for us.
    let cancelDesktopMotion: (() => void) | undefined;
    const desktop = window.matchMedia(DESKTOP_QUERY);

    const syncParallax = () => {
      if (desktop.matches && !cancelDesktopMotion) {
        const drift = animate(
          driftElement,
          { scale: [1, DRIFT_SCALE] },
          { duration: AMBIENT.drift, ease: MOTION_EASES.ambient, repeat: Infinity, repeatType: "reverse" },
        );
        const parallax = animate(parallaxElement, { y: ["0%", `${PARALLAX_TRAVEL_PERCENT}%`] }, { ease: "linear" });
        // Matches the retired ScrollTrigger range exactly: `start: "top bottom"`
        // is the target's start meeting the container's end, and
        // `end: "bottom top"` is its end meeting the container's start.
        const cancelScroll = scroll(parallax, { target: wrapper, offset: ["start end", "end start"] });
        cancelDesktopMotion = () => {
          cancelScroll();
          parallax.stop();
          drift.stop();
          parallaxElement.style.transform = "";
          driftElement.style.transform = "";
        };
      } else if (!desktop.matches && cancelDesktopMotion) {
        cancelDesktopMotion();
        cancelDesktopMotion = undefined;
      }
    };

    syncParallax();
    desktop.addEventListener("change", syncParallax);

    return () => {
      desktop.removeEventListener("change", syncParallax);
      cancelDesktopMotion?.();
    };
  }, [prefersReducedMotion]);

  return (
    <div ref={wrapperRef} className="absolute inset-0 hidden overflow-hidden xl:block">
      <div
        ref={parallaxRef}
        className="absolute inset-x-0"
        style={{ top: `-${PARALLAX_OVERSCAN_PERCENT}%`, bottom: `-${PARALLAX_OVERSCAN_PERCENT}%` }}
      >
        <div ref={driftRef} className="absolute inset-0">
          <Image src={src} alt="" fill priority sizes="100vw" className="object-cover object-center" />
        </div>
      </div>
    </div>
  );
}
