"use client";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { animate, type AnimationPlaybackControls } from "motion";
import { Pause, Play } from "lucide-react";
import type { LocalizedReview } from "@/lib/domain/review";
import { useIsRtl } from "@/hooks/useIsRtl";
import { usePrefersReducedMotion } from "@/lib/animation/use-prefers-reduced-motion";
import { INTERVALS_MS } from "@/lib/animation/motion-tokens";
import { ReviewCard } from "@/components/reviews/review-card";
import { CAROUSEL_CONTROL_BUTTON_CLASS } from "@/components/ui/carousel-control-button";
import { cn } from "@/lib/cn";

export interface TestimonialRailProps {
  reviews: LocalizedReview[];
}

/**
 * Distributes the minority variant (usually `standard`, since real data
 * skews featured) evenly through the majority instead of leaving every
 * instance of it clumped at one end — which is what a plain
 * `sort by featured` produced: 3-4 deep-`primary` cards in a row before
 * any white one, reading as "every card is featured" rather than as a
 * rhythm between two treatments. Exported for the section's own doc
 * comment, not because anything else consumes it.
 */
export function interleaveByFeatured(reviews: LocalizedReview[]): LocalizedReview[] {
  const featured = reviews.filter((review) => review.featured);
  const standard = reviews.filter((review) => !review.featured);
  const [major, minor] = featured.length >= standard.length ? [featured, standard] : [standard, featured];
  if (minor.length === 0) return major;

  const result: LocalizedReview[] = [];
  const ratio = major.length / minor.length;
  let minorIndex = 0;
  major.forEach((item, index) => {
    result.push(item);
    if (Math.floor((index + 1) / ratio) > minorIndex && minorIndex < minor.length) {
      result.push(minor[minorIndex]);
      minorIndex += 1;
    }
  });
  while (minorIndex < minor.length) {
    result.push(minor[minorIndex]);
    minorIndex += 1;
  }
  return result;
}

/**
 * A continuously-travelling testimonial rail — full-bleed, not a
 * discrete-slide carousel. This is a different motion pattern from
 * `docs/motion-system.md`'s six layers, deliberately: layer 2 (ambient) is
 * explicitly "never on anything carrying information", and this rail's
 * whole job is to carry real review content, so it can't be classified as
 * ambient decoration. It's the same family as the existing
 * `useCarouselAutoplay` strip on `/reviews` (auto-advancing real content,
 * governed by WCAG 2.2.2 rather than the aesthetic layer contract) — just
 * continuous instead of discrete-step. Documented as its own case in
 * `docs/motion-system.md` rather than silently stretched into layer 2.
 *
 * **How the loop is seamless.** The track renders the (interleaved) list
 * twice back to back and animates `x` from `"0%"` to `"±50%"` — exactly one
 * copy's width, whatever that turns out to be in pixels — on an infinite
 * linear repeat. At the instant the loop resets from -50% to 0%, copy two
 * is sitting exactly where copy one started, so the reset is invisible.
 * `ease: "linear"` is load-bearing, not a default: any easing curve would
 * change speed across the loop and make the seam visible as a stutter.
 * The second copy is `decorative` on `ReviewCard` (`variant="rail"`) —
 * real DOM so the animation has something to scroll into, but pulled out
 * of the accessibility tree and tab order so a keyboard/AT user never
 * encounters each review twice.
 *
 * The card itself is the same `ReviewCard` `/reviews` uses, not a
 * homepage-only component — see that file's doc comment for what the
 * `"rail"` variant actually changes (size and, for a featured review, the
 * fill) versus what it deliberately doesn't (data model, lightbox, link
 * semantics, accessible structure).
 *
 * **Direction is logical, not physical.** It travels toward inline-start —
 * physically leftward in `/en`, rightward in `/ar` — via `isRtl` flipping
 * the sign, the same convention every directional icon in this app already
 * follows, rather than always scrolling one physical way regardless of
 * reading direction.
 *
 * **Pause sources are independent and either one stops it**: a manual
 * toggle (the WCAG 2.2.2 requirement — automatically moving content over
 * five seconds needs an explicit stop control, and hover/focus pausing is
 * not that, since a keyboard or screen-reader user reading content further
 * down the page never hovers anything) and hover/focus-within on the rail
 * itself (so reading a card's text or tabbing to its link doesn't fight
 * the animation). `prefers-reduced-motion` skips the animation entirely
 * and falls back to a plain horizontally-scrollable row of the
 * un-duplicated list — reachable, not moving, and not doubled.
 */
export function TestimonialRail({ reviews }: TestimonialRailProps) {
  const t = useTranslations("reviews");
  const isRtl = useIsRtl();
  const prefersReducedMotion = usePrefersReducedMotion();
  const trackRef = useRef<HTMLUListElement>(null);
  const controlsRef = useRef<AnimationPlaybackControls | null>(null);
  const [userPaused, setUserPaused] = useState(false);
  const [transientPaused, setTransientPaused] = useState(false);

  const ordered = interleaveByFeatured(reviews);
  const shouldAnimate = ordered.length > 0 && !prefersReducedMotion;

  useEffect(() => {
    const track = trackRef.current;
    if (!track || !shouldAnimate) return;

    const target = isRtl ? "50%" : "-50%";
    controlsRef.current = animate(
      track,
      { x: ["0%", target] },
      { duration: ordered.length * (INTERVALS_MS.slideDwell / 1000), ease: "linear", repeat: Infinity },
    );

    return () => {
      controlsRef.current?.stop();
      controlsRef.current = null;
    };
    // `ordered.length` (not `ordered` itself) — a stable dependency; the review
    // set doesn't change client-side, and re-keying on array identity would
    // restart the animation from 0% on every render for no reason.
  }, [shouldAnimate, isRtl, ordered.length]);

  useEffect(() => {
    if (!shouldAnimate) return;
    if (userPaused || transientPaused) controlsRef.current?.pause();
    else controlsRef.current?.play();
  }, [shouldAnimate, userPaused, transientPaused]);

  if (ordered.length === 0) return null;

  const pauseLabel = userPaused ? t("featured.playAutoplay") : t("featured.pauseAutoplay");

  return (
    <div>
      {shouldAnimate && (
        <div className="mb-4 flex justify-end px-4 sm:px-6 lg:px-8 xl:px-12">
          <button
            type="button"
            onClick={() => setUserPaused((paused) => !paused)}
            aria-label={pauseLabel}
            className={CAROUSEL_CONTROL_BUTTON_CLASS}
          >
            {userPaused ? (
              <Play className="size-icon-sm" aria-hidden="true" />
            ) : (
              <Pause className="size-icon-sm" aria-hidden="true" />
            )}
          </button>
        </div>
      )}

      <div
        className={cn("overflow-hidden", !shouldAnimate && "overflow-x-auto")}
        onPointerEnter={() => setTransientPaused(true)}
        onPointerLeave={() => setTransientPaused(false)}
        onFocus={() => setTransientPaused(true)}
        onBlur={() => setTransientPaused(false)}
      >
        <ul ref={trackRef} className="flex w-max gap-6 py-2">
          {ordered.map((review, index) => (
            <li key={`${review._id}-a-${index}`} className="w-80 shrink-0 sm:w-96 lg:w-[26rem]">
              <ReviewCard review={review} variant="rail" className="h-full" />
            </li>
          ))}
          {shouldAnimate &&
            ordered.map((review, index) => (
              <li key={`${review._id}-b-${index}`} className="w-80 shrink-0 sm:w-96 lg:w-[26rem]">
                <ReviewCard review={review} variant="rail" decorative className="h-full" />
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
}
