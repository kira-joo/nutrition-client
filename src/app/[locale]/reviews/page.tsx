import type { Locale } from "@/constant/Locale.enum";
import { getReviews } from "@/lib/data";
import { ReviewsGrid } from "@/sections/reviews/reviews-grid";

interface ReviewsPageProps {
  params: { locale: Locale };
  searchParams: Record<string, string | string[] | undefined>;
}

/** A bad/missing `?page=` falls back to 1 rather than erroring — same policy as Recipes' filter parsing. */
function parsePage(searchParams: ReviewsPageProps["searchParams"]): number {
  const raw = Array.isArray(searchParams.page) ? searchParams.page[0] : searchParams.page;
  const page = Number(raw);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

/**
 * No detail route: nutrition-staff exposes no public single-review GET
 * endpoint (`src/app/api/public/reviews/` has only the list `route.ts` —
 * verified directly against that repo, no `[id]` sub-route exists there).
 * A locked before/after split and the full testimonial text are both
 * already renderable inline in a card or its lightbox, so there's nothing
 * a separate page would add; the legacy `/reviews/[id]` page was deleted
 * rather than rebuilt.
 */
export default async function ReviewsPage({ params, searchParams }: ReviewsPageProps) {
  const page = parsePage(searchParams);
  const result = await getReviews(params.locale, { page });

  return <ReviewsGrid result={result} page={page} />;
}
