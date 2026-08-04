import type { PaginatedResponse } from "@kira-joo/toolkit-common";
import { MethodType, type Endpoint } from "@kira-joo/frontend-toolkit-core/server";
import { PublicApiRoute } from "./public-api-route";
import type { Video } from "../src/lib/domain/video";

export const listVideosEndpoint: Endpoint<{
  query: { page?: number; limit?: number; search?: string };
  returnType: PaginatedResponse<Video>;
}> = {
  url: PublicApiRoute.VIDEOS,
  methodType: MethodType.GET,
};
