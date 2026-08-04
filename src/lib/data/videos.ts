import type { PaginatedResponse } from "@kira-joo/toolkit-common";
import { listVideosEndpoint } from "../../../api/videos.endpoints";
import { fetchPublic } from "@/lib/api/fetch-public";
import { CacheTag } from "@/lib/cache/cache-tags";
import type { Video, VideosListParams } from "@/lib/domain/video";

export async function getVideos(params: VideosListParams = {}): Promise<PaginatedResponse<Video>> {
  return fetchPublic(listVideosEndpoint, { query: params, tags: [CacheTag.VIDEOS] });
}
