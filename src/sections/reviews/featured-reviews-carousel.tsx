"use client";
import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import useEmblaCarousel, { type UseEmblaCarouselType } from "embla-carousel-react";
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from "lucide-react";
import type { LocalizedReview } from "@/lib/domain/review";
import { useIsRtl } from "@/hooks/useIsRtl";
import { ReviewCard } from "@/components/reviews/review-card";
import { useCarouselAutoplay, type AutoplayAction } from "./use-carousel-autoplay";

export interface FeaturedReviewsCarouselProps {
  /** Already filtered to `featured: true` by the caller — see reviews-grid.tsx for why. */
  reviews: LocalizedReview[];
}

/**
 * Derived from the hook's own return type rather than imported from
 * `embla-carousel`: that package is only a transitive dependency of
 * `embla-carousel-react`, so importing it directly was a phantom dependency
 * that happens to resolve under npm's flat hoisting but breaks under strict
 * resolution (pnpm/Yarn PnP) or if the react wrapper repins it. Deriving it
 * keeps the type pinned to whatever version is actually installed.
 */
type EmblaApi = NonNullable<UseEmblaCarouselType[1]>;

/**
 * `touch:` grows these to a real 44px target on a coarse pointer. They were 36px
 * — measured, not assumed — which is below the app's own `--touch-target-min`,
 * and sat in the same row as the 44px header trigger. Gated on pointer
 * capability rather than a viewport breakpoint, because a wide touch tablet
 * passes `sm:` and still has no mouse; `control-md` is 2.75rem, the same value
 * `--touch-target-min` resolves to, so this is the token agreeing with itself
 * rather than a magic number.
 */
const CONTROL_BUTTON_CLASS =
  "flex h-control-sm w-control-sm items-center justify-center rounded-full border-hairline border-border bg-surface text-text-primary transition-colors duration-base ease-standard pointer:hover:border-primary pointer:hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 touch:h-control-md touch:w-control-md";

/**
 * The control says what pressing it does, so the label follows the action.
 *
 * `as const satisfies` rather than a `Record<AutoplayAction, string>`
 * annotation: next-intl types `t()` against the real message tree, so widening
 * these to `string` makes the call fail to typecheck. `as const` keeps them as
 * literals and `satisfies` still proves every action has a label.
 */
const AUTOPLAY_LABEL_KEY = {
  pause: "featured.pauseAutoplay",
  resume: "featured.playAutoplay",
  restart: "featured.restartAutoplay",
} as const satisfies Record<AutoplayAction, string>;

/**
 * The site's one carousel (per the plan referenced in
 * `discovery-section.tsx`): a "featured stories" strip, gated on there
 * being enough featured reviews to make swiping worthwhile rather than
 * rendering a one-slide carousel. Reviews here are also rendered again in
 * the plain grid below, unfiltered — mirroring the homepage preview
 * section's own precedent (re-order/duplicate what was fetched, never
 * refetch or drop) rather than removing them from the main wall.
 *
 * `direction` follows the real document direction (`useIsRtl`), and the
 * prev/next icons swap to match — Embla doesn't infer this from `dir` on
 * an ancestor element.
 *
 * It advances on its own (see `useCarouselAutoplay`), which brings an
 * obligation with it: automatically moving content that runs for more than five
 * seconds needs an explicit way to stop it (WCAG 2.2.2). Pausing on hover and
 * on focus-within is not that mechanism — someone reading with a keyboard or a
 * screen reader further down the page never hovers anything — so there is a real
 * pause button, and it is the first control in the group so it is reachable
 * before the slide controls. Under `prefers-reduced-motion` autoplay never runs
 * and the button is not rendered, because there would be nothing to pause.
 *
 * The hover/focus pause handlers go on the **slides** region only. They exist to
 * avoid interrupting someone reading a card, and putting them on the whole block
 * meant the pause control suspended autoplay by being focused — so pressing
 * "resume" left focus on the button and the timer never restarted.
 */
export function FeaturedReviewsCarousel({ reviews }: FeaturedReviewsCarouselProps) {
  const t = useTranslations("reviews");
  const isRtl = useIsRtl();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, align: "start", direction: isRtl ? "rtl" : "ltr" });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const autoplay = useCarouselAutoplay(emblaApi);

  const onSelect = useCallback((api: EmblaApi) => {
    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect(emblaApi);
    emblaApi.on("select", onSelect).on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect).off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  // A carousel earns its keep only with enough slides to genuinely swipe
  // through — below that, the plain grid below already shows these same
  // reviews, so a one-or-two-slide "carousel" would add controls for
  // nothing (per the plan's "don't add one" rule).
  if (reviews.length < 3) return null;

  const PrevIcon = isRtl ? ChevronRight : ChevronLeft;
  const NextIcon = isRtl ? ChevronLeft : ChevronRight;

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-heading-2 font-bold text-text-primary">{t("featured.heading")}</h2>
        <div className="flex items-center gap-2">
          {autoplay.isAvailable ? (
            <button
              type="button"
              onClick={autoplay.press}
              /* An action label, and deliberately no `aria-pressed`: the ARIA
                 toggle-button pattern expects a stable name with the state in
                 `aria-pressed`, and mixing a changing name with it says the same
                 thing twice, inconsistently. This button also has three actions,
                 not two, which a pressed/unpressed toggle cannot express. */
              aria-label={t(AUTOPLAY_LABEL_KEY[autoplay.action])}
              className={CONTROL_BUTTON_CLASS}
            >
              {autoplay.action === "pause" ? (
                <Pause className="size-icon-sm" aria-hidden="true" />
              ) : autoplay.action === "restart" ? (
                <RotateCcw className="size-icon-sm" aria-hidden="true" />
              ) : (
                <Play className="size-icon-sm" aria-hidden="true" />
              )}
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => emblaApi?.scrollPrev()}
            disabled={!canScrollPrev}
            aria-label={t("pagination.previous")}
            className={CONTROL_BUTTON_CLASS}
          >
            <PrevIcon className="size-icon-sm" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => emblaApi?.scrollNext()}
            disabled={!canScrollNext}
            aria-label={t("pagination.next")}
            className={CONTROL_BUTTON_CLASS}
          >
            <NextIcon className="size-icon-sm" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="mt-6 overflow-hidden" ref={emblaRef} {...autoplay.slidesProps}>
        <ul className="flex gap-6">
          {reviews.map((review) => (
            <li key={review._id} className="min-w-0 flex-[0_0_85%] sm:flex-[0_0_55%] lg:flex-[0_0_32%]">
              <ReviewCard review={review} className="mb-0 h-full" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
