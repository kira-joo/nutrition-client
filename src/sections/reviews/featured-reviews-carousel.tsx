"use client";
import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import useEmblaCarousel from "embla-carousel-react";
import type { EmblaCarouselType } from "embla-carousel";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { LocalizedReview } from "@/lib/domain/review";
import { useIsRtl } from "@/hooks/useIsRtl";
import { ReviewCard } from "@/components/reviews/review-card";

export interface FeaturedReviewsCarouselProps {
  /** Already filtered to `featured: true` by the caller — see reviews-grid.tsx for why. */
  reviews: LocalizedReview[];
}

const CONTROL_BUTTON_CLASS =
  "flex h-control-sm w-control-sm items-center justify-center rounded-full border-hairline border-border bg-surface text-text-primary transition-colors duration-base ease-standard hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40";

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
 */
export function FeaturedReviewsCarousel({ reviews }: FeaturedReviewsCarouselProps) {
  const t = useTranslations("reviews");
  const isRtl = useIsRtl();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, align: "start", direction: isRtl ? "rtl" : "ltr" });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const onSelect = useCallback((api: EmblaCarouselType) => {
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

      <div className="mt-6 overflow-hidden" ref={emblaRef}>
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
