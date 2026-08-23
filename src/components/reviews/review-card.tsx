"use client";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { ExternalLink, Expand, UserRound } from "lucide-react";
import type { LocalizedReview } from "@/lib/domain/review";
import { SiteLightbox } from "@/components/gallery/site-lightbox";
import { useLightbox } from "@/components/gallery/use-lightbox";
import { StarRating } from "@/components/ui/star-rating";
import { MediaPill } from "@/components/ui/media-pill";
import { cn } from "@/lib/cn";
import { SURFACE_HOVER_ELEVATION, SURFACE_MEDIA_ZOOM } from "@/components/ui/surface";

export interface ReviewCardProps {
  review: LocalizedReview;
  /**
   * `"grid"` (default) is the `/reviews` page's card; `"rail"` is the
   * homepage `TestimonialRail`'s. This prop scopes *layout-driven*
   * differences only — the things a masonry column and a fixed-width
   * moving card genuinely can't share: image aspect ratio (grid can run
   * tall; rail can't, or it breaks the rail's fixed height), the masonry
   * margin/`break-inside-avoid`, whether the quote is clamped, and header
   * scale. It does **not** vary the shell shape, the border, or — the one
   * this used to get wrong — the featured treatment: a featured review
   * used to get a small "Featured" pill on `grid` and a full deep-`primary`
   * fill on `rail`, the same underlying data rendered as two different
   * designs. Both variants now use the same `surface-notched` shape and
   * the same deep-fill-plus-gold treatment for `review.featured` — same
   * product surface, laid out two different ways, not two visual
   * languages sharing a data model.
   */
  variant?: "grid" | "rail";
  /**
   * True for a rail's second, duplicated copy of the list (the seamless
   * `TestimonialRail` loop technique — see that component). Real DOM so
   * the animation has something to scroll into, but pulled out of the
   * accessibility tree and out of tab order: `aria-hidden` alone does not
   * remove a focusable descendant from keyboard tab order, so both
   * interactive elements here (the image's lightbox button, the source
   * link) get `tabIndex={-1}` explicitly, or a keyboard user would tab
   * through every review twice.
   */
  decorative?: boolean;
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
 * docs/design-system.md) rather than a second image-viewing mechanism, in
 * both variants — the rail doesn't get a different way to view the photo.
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
 *
 * No fake clickable wrapper: the card is an `<article>`, never an `<a>` or
 * a `div` with an `onClick`. The image is a real `<button>` (opens the
 * lightbox) and the source link is a real `<a>` — two separately reachable
 * controls with their own accessible names, which is also what keeps a
 * `<button>` from ever ending up nested inside an `<a>` (invalid HTML the
 * "wrap everything in one link" approach would have produced here, since
 * the card has two genuinely different destinations, not one).
 */
export function ReviewCard({ review, variant = "grid", decorative = false, className }: ReviewCardProps) {
  const t = useTranslations("reviews");
  const { openIndex, setOpenIndex, close, registerTrigger } = useLightbox();
  const isRail = variant === "rail";
  const isFeatured = review.featured;

  const hasBeforeAfter = Boolean(review.beforeImage && review.afterImage);
  const media = hasBeforeAfter
    ? [
        { src: review.beforeImage!.secureUrl, alt: `${t("card.before")} — ${review.authorName}`, width: review.beforeImage!.width, height: review.beforeImage!.height },
        { src: review.afterImage!.secureUrl, alt: `${t("card.after")} — ${review.authorName}`, width: review.afterImage!.width, height: review.afterImage!.height },
      ]
    : review.image
      ? [{ src: review.image.secureUrl, alt: t("card.photoAlt", { name: review.authorName }), width: review.image.width, height: review.image.height }]
      : [];

  // The rail's short-and-wide proportion is almost entirely this: a
  // 21:9-ish band instead of 4:3/1:1, so the photo can't push the card
  // tall. `aspect-square` for the grid's before/after halves is
  // untouched — that variant's card has no height budget to protect.
  const singleImageAspect = isRail ? "aspect-[16/7]" : "aspect-[4/3]";
  const beforeAfterAspect = isRail ? "aspect-[3/2]" : "aspect-square";

  return (
    <article
      aria-hidden={decorative || undefined}
      className={cn(
        "flex h-full flex-col overflow-hidden surface-notched",
        !isRail && "mb-6 break-inside-avoid",
        isFeatured
          ? "bg-primary text-white shadow-package"
          : cn("border-hairline border-primary/15 bg-surface text-text-primary", isRail ? "shadow-sm" : SURFACE_HOVER_ELEVATION),
        className
      )}
    >
      <div className={cn("flex items-center justify-between gap-3", isRail ? cn("p-5", isFeatured ? "pb-3" : "pb-2") : "p-5 pb-0")}>
        <div className="flex min-w-0 items-center gap-2">
          <span
            aria-hidden="true"
            className={cn(
              "flex shrink-0 items-center justify-center rounded-full",
              isRail ? "size-icon-lg" : "size-icon-xl",
              isFeatured ? "bg-white/15 text-white" : "bg-primary-soft text-primary"
            )}
          >
            <UserRound className={isRail ? "size-icon-sm" : "size-icon-md"} />
          </span>
          <cite className={cn("min-w-0 truncate font-bold not-italic", isRail ? "text-body-sm" : "break-words text-body-lg", isFeatured ? "text-white" : "text-text-primary")}>{review.authorName}</cite>
        </div>
        {review.rating ? (
          <StarRating
            rating={review.rating}
            label={t("card.ratingLabel", { rating: review.rating })}
            tone={isFeatured ? "dark-surface" : "default"}
            className="shrink-0"
          />
        ) : null}
      </div>

      {hasBeforeAfter ? (
        <div className="grid grid-cols-2">
          <button
            ref={registerTrigger(0)}
            type="button"
            onClick={() => setOpenIndex(0)}
            tabIndex={decorative ? -1 : undefined}
            className={cn("group relative overflow-hidden bg-surface-muted", beforeAfterAspect)}
          >
            <Image
              src={review.beforeImage!.secureUrl}
              alt={media[0]?.alt ?? ""}
              fill
              sizes="(min-width: 1024px) 15vw, (min-width: 640px) 22vw, 50vw"
              className={cn("object-cover", SURFACE_MEDIA_ZOOM)}
              placeholder={review.beforeImage!.placeholderUrl ? "blur" : undefined}
              blurDataURL={review.beforeImage!.placeholderUrl}
            />
            <MediaPill position="top-start">{t("card.before")}</MediaPill>
          </button>
          <button
            ref={registerTrigger(1)}
            type="button"
            onClick={() => setOpenIndex(1)}
            tabIndex={decorative ? -1 : undefined}
            className={cn("group relative overflow-hidden bg-surface-muted", beforeAfterAspect)}
          >
            <Image
              src={review.afterImage!.secureUrl}
              alt={media[1]?.alt ?? ""}
              fill
              sizes="(min-width: 1024px) 15vw, (min-width: 640px) 22vw, 50vw"
              className={cn("object-cover", SURFACE_MEDIA_ZOOM)}
              placeholder={review.afterImage!.placeholderUrl ? "blur" : undefined}
              blurDataURL={review.afterImage!.placeholderUrl}
            />
            <MediaPill position="top-start">{t("card.after")}</MediaPill>
          </button>
        </div>
      ) : review.image ? (
        <button
          ref={registerTrigger(0)}
          type="button"
          onClick={() => setOpenIndex(0)}
          tabIndex={decorative ? -1 : undefined}
          className={cn("group relative w-full overflow-hidden bg-surface-muted", singleImageAspect)}
        >
          <Image
            src={review.image.secureUrl}
            alt={media[0]?.alt ?? ""}
            fill
            sizes={isRail ? "(min-width: 1024px) 26rem, 20rem" : "(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"}
            className={cn("object-cover", isRail ? "object-top" : "", SURFACE_MEDIA_ZOOM)}
            placeholder={review.image.placeholderUrl ? "blur" : undefined}
            blurDataURL={review.image.placeholderUrl}
          />
          <MediaPill position="bottom-end" revealOnHover icon={<Expand className="size-icon-sm" aria-hidden="true" />}>
            {t("card.viewPhoto")}
          </MediaPill>
        </button>
      ) : null}

      <div className={cn("flex flex-1 flex-col gap-2", isRail ? "p-5 pt-3" : "gap-3 p-5")}>
        {review.content && (
          <blockquote className={cn("min-w-0 break-words", isRail ? "line-clamp-2 text-body-sm" : "text-body", !isFeatured && "text-text-secondary")}>
            <p>&ldquo;{review.content}&rdquo;</p>
          </blockquote>
        )}

        <footer className={cn("flex min-w-0 items-center gap-2", isRail ? "mt-auto" : "mt-auto flex-col gap-2")}>
          {review.authorLabel && (
            <span className={cn("min-w-0 flex-1 truncate text-caption", isFeatured ? "text-white/70" : "text-text-muted")}>{review.authorLabel}</span>
          )}

          {review.sourceUrl && (
            <a
              href={review.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              tabIndex={decorative ? -1 : undefined}
              className={
                isRail
                  ? cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-full transition-colors duration-fast",
                      isFeatured ? "text-white/60 pointer:hover:text-white" : "text-text-muted pointer:hover:text-primary"
                    )
                  : cn(
                      /* 25px as a bare text line, the smallest real target on the site. */
                      "inline-flex w-fit items-center gap-1.5 text-body-sm font-semibold pointer:hover:underline touch:min-h-touch-min",
                      isFeatured ? "text-white" : "text-primary"
                    )
              }
            >
              {isRail ? (
                <>
                  <ExternalLink className="size-icon-sm" aria-hidden="true" />
                  <span className="sr-only">
                    {t("card.sourceLink")} — {review.authorName} ({t("card.opensInNewTab")})
                  </span>
                </>
              ) : (
                <>
                  {t("card.sourceLink")}
                  <ExternalLink className="size-icon-sm shrink-0" aria-hidden="true" />
                  <span className="sr-only">({t("card.opensInNewTab")})</span>
                </>
              )}
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
