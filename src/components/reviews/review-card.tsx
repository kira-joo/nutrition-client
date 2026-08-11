"use client";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { ExternalLink, Expand, Star, UserRound } from "lucide-react";
import type { LocalizedReview } from "@/lib/domain/review";
import { SiteLightbox } from "@/components/gallery/site-lightbox";
import { useLightbox } from "@/components/gallery/use-lightbox";
import { StarRating } from "@/components/ui/star-rating";
import { cn } from "@/lib/cn";

export interface ReviewCardProps {
  review: LocalizedReview;
  className?: string;
}

/**
 * One shared shell, rendering whichever of the four populated-field
 * combinations the record actually has — per `src/lib/domain/review.ts`'s
 * documented business rule, a review is guaranteed only content, an image,
 * or a complete before/after pair (never a fixed shape), so nothing here
 * assumes more than one is present. `content`/`authorLabel` degrade to
 * nothing when blank (verified against live data: at least one real record
 * has an empty `authorLabel` in both locales); `authorName` always renders,
 * per the domain type's guarantee.
 *
 * Before/after is a locked-width side-by-side split, never a slider — an
 * explicit earlier design decision. Both halves and a lone `image` open the
 * same shared lightbox (`useLightbox`/`SiteLightbox`, per
 * docs/design-system.md) rather than a second image-viewing mechanism.
 *
 * `rating` is optional — reviews created before that field existed have
 * none — so the header row's star display only renders once a real value
 * is present; there's no fabricated default rating.
 *
 * The header row's two groups (identity, rating) are plain DOM order plus
 * logical `justify-between` — no manual left/right positioning — so the
 * identity group sits at the row's inline *start* and the rating at its
 * inline *end* in both directions: physically left→right in `en`, and
 * mirrored to right→left in `ar` by the inherited `dir="rtl"` alone,
 * exactly like every other physical-position-free layout in this app (see
 * `docs/design-system.md`'s RTL conventions).
 */
export function ReviewCard({ review, className }: ReviewCardProps) {
  const t = useTranslations("reviews");
  const { openIndex, setOpenIndex, close, registerTrigger } = useLightbox();

  const hasBeforeAfter = Boolean(review.beforeImage && review.afterImage);
  const media = hasBeforeAfter
    ? [
        { src: review.beforeImage!.secureUrl, alt: `${t("card.before")} — ${review.authorName}`, width: review.beforeImage!.width, height: review.beforeImage!.height },
        { src: review.afterImage!.secureUrl, alt: `${t("card.after")} — ${review.authorName}`, width: review.afterImage!.width, height: review.afterImage!.height },
      ]
    : review.image
      ? [{ src: review.image.secureUrl, alt: t("card.photoAlt", { name: review.authorName }), width: review.image.width, height: review.image.height }]
      : [];

  return (
    <article
      className={cn(
        "mb-6 flex break-inside-avoid flex-col overflow-hidden rounded-xl border-hairline border-primary/25 bg-surface shadow-sm transition-shadow duration-base ease-standard hover:shadow-md",
        className
      )}
    >
      <div className="flex items-center justify-between gap-3 p-5 pb-0">
        <div className="flex min-w-0 items-center gap-2">
          <span
            aria-hidden="true"
            className="flex size-icon-xl shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary"
          >
            <UserRound className="size-icon-md" />
          </span>
          <cite className="min-w-0 break-words text-body-lg font-bold not-italic text-text-primary">{review.authorName}</cite>
        </div>
        {review.rating ? (
          <StarRating rating={review.rating} label={t("card.ratingLabel", { rating: review.rating })} className="shrink-0" />
        ) : null}
      </div>

      {hasBeforeAfter ? (
        <div className="grid grid-cols-2">
          <button
            ref={registerTrigger(0)}
            type="button"
            onClick={() => setOpenIndex(0)}
            className="group relative aspect-square overflow-hidden bg-surface-muted"
          >
            <Image
              src={review.beforeImage!.secureUrl}
              alt={media[0]?.alt ?? ""}
              fill
              sizes="(min-width: 1024px) 15vw, (min-width: 640px) 22vw, 50vw"
              className="object-cover transition-transform duration-base ease-standard group-hover:scale-105"
              placeholder={review.beforeImage!.placeholderUrl ? "blur" : undefined}
              blurDataURL={review.beforeImage!.placeholderUrl}
            />
            <span className="absolute top-2 start-2 rounded-full bg-surface/90 px-2.5 py-1 text-caption font-semibold text-text-primary backdrop-blur">
              {t("card.before")}
            </span>
          </button>
          <button
            ref={registerTrigger(1)}
            type="button"
            onClick={() => setOpenIndex(1)}
            className="group relative aspect-square overflow-hidden bg-surface-muted"
          >
            <Image
              src={review.afterImage!.secureUrl}
              alt={media[1]?.alt ?? ""}
              fill
              sizes="(min-width: 1024px) 15vw, (min-width: 640px) 22vw, 50vw"
              className="object-cover transition-transform duration-base ease-standard group-hover:scale-105"
              placeholder={review.afterImage!.placeholderUrl ? "blur" : undefined}
              blurDataURL={review.afterImage!.placeholderUrl}
            />
            <span className="absolute top-2 start-2 rounded-full bg-surface/90 px-2.5 py-1 text-caption font-semibold text-text-primary backdrop-blur">
              {t("card.after")}
            </span>
          </button>
        </div>
      ) : review.image ? (
        <button
          ref={registerTrigger(0)}
          type="button"
          onClick={() => setOpenIndex(0)}
          className="group relative aspect-[4/3] w-full overflow-hidden bg-surface-muted"
        >
          <Image
            src={review.image.secureUrl}
            alt={media[0]?.alt ?? ""}
            fill
            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
            className="object-cover transition-transform duration-base ease-standard group-hover:scale-105"
            placeholder={review.image.placeholderUrl ? "blur" : undefined}
            blurDataURL={review.image.placeholderUrl}
          />
          <span className="absolute bottom-3 end-3 flex items-center gap-1.5 rounded-full bg-surface/90 px-3 py-1.5 text-caption font-semibold text-text-primary opacity-0 backdrop-blur transition-opacity duration-base ease-standard group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none">
            <Expand className="size-icon-sm" aria-hidden="true" />
            {t("card.viewPhoto")}
          </span>
        </button>
      ) : null}

      <div className="flex flex-1 flex-col gap-3 p-5">
        {review.featured && (
          <span className="inline-flex w-fit items-center gap-1 rounded-full bg-accent-soft px-2.5 py-1 text-caption font-semibold text-accent">
            <Star className="size-icon-sm" aria-hidden="true" />
            {t("card.featured")}
          </span>
        )}

        {review.content && (
          <blockquote className="min-w-0 break-words text-body text-text-secondary">
            <p>&ldquo;{review.content}&rdquo;</p>
          </blockquote>
        )}

        <footer className="mt-auto flex min-w-0 flex-col gap-2">
          {review.authorLabel && (
            <span className="min-w-0 break-words text-caption text-text-muted">{review.authorLabel}</span>
          )}

          {review.sourceUrl && (
            <a
              href={review.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit items-center gap-1.5 text-body-sm font-semibold text-primary hover:underline"
            >
              {t("card.sourceLink")}
              <ExternalLink className="size-icon-sm shrink-0" aria-hidden="true" />
              <span className="sr-only">({t("card.opensInNewTab")})</span>
            </a>
          )}
        </footer>
      </div>

      {openIndex !== null && media.length > 0 && (
        <SiteLightbox images={media} index={openIndex} onIndexChange={setOpenIndex} onClose={close} />
      )}
    </article>
  );
}
