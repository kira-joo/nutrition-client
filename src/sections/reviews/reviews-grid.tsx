import { getTranslations } from "next-intl/server";
import { Quote } from "lucide-react";
import type { PaginatedResponse } from "@kira-joo/toolkit-common";
import type { LocalizedReview } from "@/lib/domain/review";
import AppRoute from "@/constant/AppRoute.enum";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Link } from "@/i18n/navigation";
import { ReviewCard } from "@/components/reviews/review-card";
import { FeaturedReviewsCarousel } from "@/sections/reviews/featured-reviews-carousel";

export interface ReviewsGridProps {
  result: PaginatedResponse<LocalizedReview>;
  page: number;
}

/**
 * Page-level composition: heading, an optional featured strip, the main
 * wall of reviews, and pagination. Deliberately a CSS multi-column layout
 * (`columns-*`, not `grid-cols-*`) rather than the equal-height grid every
 * other listing page on the site uses (Recipes, FAQ) — review cards vary a
 * lot in height (text-only vs. image-forward vs. before/after), and a
 * masonry-style wall reads as a genuine desktop composition rather than the
 * mobile single column just stretched wider (per the design brief).
 *
 * Filtering/paging is entirely server-driven; this renders whatever page
 * came back, in the order it came back — the one exception being the
 * separate featured strip above, which is a filtered VIEW of the same
 * fetched page, never a reorder of the grid itself (see
 * `src/lib/data/reviews.ts`'s "never reorder" rule).
 */
export async function ReviewsGrid({ result, page }: ReviewsGridProps) {
  const t = await getTranslations("reviews");
  const totalPages = result.totalPages ?? 1;
  const featured = page === 1 ? result.data.filter((review) => review.featured) : [];

  return (
    <Section>
      <Container>
        <header className="flex flex-col gap-3">
          <h1 className="text-display font-extrabold text-text-primary">{t("heading")}</h1>
          <p className="max-w-narrow text-body text-text-secondary">{t("intro")}</p>
        </header>

        {featured.length > 0 && (
          <div className="mt-10">
            <FeaturedReviewsCarousel reviews={featured} />
          </div>
        )}

        <div className="mt-10">
          {result.data.length === 0 ? (
            <EmptyReviews />
          ) : (
            <ul className="columns-1 gap-6 sm:columns-2 lg:columns-3">
              {result.data.map((review) => (
                <li key={review._id} className="mb-6 break-inside-avoid">
                  <ReviewCard review={review} className="mb-0" />
                </li>
              ))}
            </ul>
          )}
        </div>

        {totalPages > 1 && <Pagination page={page} totalPages={totalPages} />}
      </Container>
    </Section>
  );
}

/** The only empty state reviews can genuinely be in: nothing published yet — there's no search/filter UI here to have matched zero results against. */
async function EmptyReviews() {
  const t = await getTranslations("reviews");

  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border-hairline border-border bg-surface-muted px-6 py-14 text-center">
      <Quote aria-hidden="true" className="size-icon-xl text-text-muted" />
      <p className="max-w-md break-words text-body-lg font-semibold text-text-primary">{t("empty.noReviews")}</p>
    </div>
  );
}

/** Real links, not buttons — a page is a distinct, shareable URL (matches the Recipes pagination convention). */
async function Pagination({ page, totalPages }: { page: number; totalPages: number }) {
  const t = await getTranslations("reviews");

  const linkClass = "inline-flex h-control-sm items-center rounded-full border-hairline border-border bg-surface px-4 text-body-sm font-semibold text-text-primary hover:border-primary hover:text-primary";
  const disabledClass = "inline-flex h-control-sm items-center rounded-full border-hairline border-border px-4 text-body-sm font-semibold text-text-muted opacity-60";

  return (
    <nav aria-label={t("pagination.label")} className="mt-10 flex items-center justify-between gap-4 pt-2">
      {page > 1 ? (
        <Link href={`${AppRoute.Reviews}?page=${page - 1}`} className={linkClass} rel="prev">
          {t("pagination.previous")}
        </Link>
      ) : (
        <span className={disabledClass} aria-disabled="true">
          {t("pagination.previous")}
        </span>
      )}

      <span className="text-body-sm text-text-secondary">{t("pagination.page", { page, total: totalPages })}</span>

      {page < totalPages ? (
        <Link href={`${AppRoute.Reviews}?page=${page + 1}`} className={linkClass} rel="next">
          {t("pagination.next")}
        </Link>
      ) : (
        <span className={disabledClass} aria-disabled="true">
          {t("pagination.next")}
        </span>
      )}
    </nav>
  );
}
