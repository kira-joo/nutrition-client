import type { PaginatedResponse } from "@kira-joo/toolkit-common";
import { MethodType, type Endpoint } from "@kira-joo/frontend-toolkit-core/server";
import { PublicApiRoute } from "./public-api-route";
import type { Review } from "../src/lib/domain/review";

export const listReviewsEndpoint: Endpoint<{
  query: { page?: number; limit?: number; search?: string };
  returnType: PaginatedResponse<Review>;
}> = {
  url: PublicApiRoute.REVIEWS,
  methodType: MethodType.GET,
};
