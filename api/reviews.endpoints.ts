import type { PaginatedResponse } from "@kira-joo/toolkit-common";
import type { PublicEndpoint } from "../src/lib/api/public-endpoint.type";
import type { Review } from "../src/lib/domain/review";

export const listReviewsEndpoint: PublicEndpoint<{
  query: { page?: number; limit?: number; search?: string };
  returnType: PaginatedResponse<Review>;
}> = {
  url: "/api/public/reviews",
};
