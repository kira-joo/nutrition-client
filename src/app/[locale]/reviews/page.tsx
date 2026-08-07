import type { Locale } from "@/constant/Locale.enum";
import { getReviews } from "@/lib/data";
import { parsePage } from "@/lib/pagination/parse-page";
import { ReviewsGrid } from "@/sections/reviews/reviews-grid";

interface ReviewsPageProps {
  params: { locale: Locale };
  searchParams: Record<string, string | string[] | undefined>;
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
  const page = parsePage(searchParams.page);
  const result = await getReviews(params.locale, { page });

  return <ReviewsGrid result={result} page={page} />;
}
