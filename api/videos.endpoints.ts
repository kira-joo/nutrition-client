import type { PaginatedResponse } from "@kira-joo/toolkit-common";
import type { PublicEndpoint } from "../src/lib/api/public-endpoint.type";
import type { Video } from "../src/lib/domain/video";

export const listVideosEndpoint: PublicEndpoint<{
  query: { page?: number; limit?: number; search?: string };
  returnType: PaginatedResponse<Video>;
}> = {
  url: "/api/public/videos",
};
