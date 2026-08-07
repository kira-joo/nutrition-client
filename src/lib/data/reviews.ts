import { localize, type LocalizedLocale, type PaginatedResponse } from "@kira-joo/toolkit-common";
import { listReviewsEndpoint } from "../../../api/reviews.endpoints";
import { fetchPublic } from "@/lib/api/fetch-public";
import { CacheTag } from "@/lib/cache/cache-tags";
import type { LocalizedReview, Review, ReviewsListParams } from "@/lib/domain/review";

/**
 * No `featured` filter param exists server-side — a confirmed backend gap. A
 * caller that needs featured-only reviews has to filter the returned page
 * itself; this function never reorders or filters what the backend returns.
 *

 * Localization happens here, once, immediately after the fetch — never in
 * sections or components. Caching stays locale-independent on purpose: the
 * cached entry is the raw bilingual payload keyed by URL, so both locales
 * share one cache entry and one revalidation, and `localize` runs per
 * request on the already-cached data.
 */
export async function getReviews(locale: LocalizedLocale, params: ReviewsListParams = {}): Promise<PaginatedResponse<LocalizedReview>> {
  const raw: PaginatedResponse<Review> = await fetchPublic(listReviewsEndpoint, { query: params, tags: [CacheTag.REVIEWS] });
  return localize(raw, locale);
}
