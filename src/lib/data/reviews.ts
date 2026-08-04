import type { PaginatedResponse } from "@kira-joo/toolkit-common";
import { listReviewsEndpoint } from "../../../api/reviews.endpoints";
import { fetchPublic } from "@/lib/api/fetch-public";
import { CacheTag } from "@/lib/cache/cache-tags";
import type { Review, ReviewsListParams } from "@/lib/domain/review";

/** No `featured` filter param exists server-side — a confirmed backend gap. A future caller that needs featured-only reviews (e.g. a homepage preview) will have to filter the returned page itself; this function never reorders or filters what the backend returns. */
export async function getReviews(params: ReviewsListParams = {}): Promise<PaginatedResponse<Review>> {
  return fetchPublic(listReviewsEndpoint, { query: params, tags: [CacheTag.REVIEWS] });
}
