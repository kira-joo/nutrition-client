"use client";
import Image from "next/image";
import { useLayoutEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/animation/gsap-config";

/** Ambient loop duration, in seconds — deliberately not one of the
 * interactive motion tokens (fast/base/slow/reveal, all sub-second): those
 * govern triggered reveals, while this is a continuous decorative drift on
 * its own much longer timescale. Forcing it onto an unrelated token would
 * only make the token set harder to reason about. */
const DRIFT_DURATION = 24;

/**
 * The real `heroSection.png` artwork as the hero's actual background —
 * never recreated with CSS gradients/shapes. Split out of `HeroSection`
 * (an async Server Component) because the ambient drift and desktop
 * parallax both need a ref + `useLayoutEffect` + GSAP, none of which can
 * live in a Server Component.
 *
 * Two motions, both `prefers-reduced-motion` gated and both left
 * deliberately subtle — the food/vegetable framing should read as "alive"
 * without competing with the doctor photo or copy sitting in front of it:
 *   - a slow, low-amplitude scale breathe, running continuously;
 *   - on desktop only, a slight vertical drift tied to scroll position.
 * `object-position` is cropped differently per breakpoint: the artwork's
 * two empty content zones sit side by side (built for a wide viewport), so
 * a narrow viewport instead gets a top-anchored crop that keeps the top
 * leaf clusters and the artwork's plain center band as its backdrop
 * (§C — mobile is recomposed, not the desktop crop simply shrunk).
 */
export function HeroBackground() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const wrapper = wrapperRef.current;
    const image = imageRef.current;
    if (!wrapper || !image || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.to(image, {
        scale: 1.045,
        duration: DRIFT_DURATION,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });

      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px)", () => {
        const parallax = gsap.to(image, {
          yPercent: 6,
          ease: "none",
          scrollTrigger: { trigger: wrapper, start: "top bottom", end: "bottom top", scrub: true },
        });
        return () => parallax.scrollTrigger?.kill();
      });
    }, wrapper);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={wrapperRef} className="absolute inset-0 overflow-hidden">
      <div ref={imageRef} className="absolute inset-0">
        <Image
          src="/images/heroSection.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-top lg:object-center"
        />
      </div>
    </div>
  );
}
