import { localize, type LocalizedLocale, type PaginatedResponse } from "@kira-joo/toolkit-common";
import { listVideosEndpoint } from "../../../api/videos.endpoints";
import { fetchPublic } from "@/lib/api/fetch-public";
import { CacheTag } from "@/lib/cache/cache-tags";
import type { LocalizedVideo, Video, VideosListParams } from "@/lib/domain/video";

/**
 * Localization happens here, once, immediately after the fetch — never in
 * sections or components. Caching stays locale-independent on purpose: the
 * cached entry is the raw bilingual payload keyed by URL, so both locales
 * share one cache entry and one revalidation, and `localize` runs per
 * request on the already-cached data.
 */
export async function getVideos(locale: LocalizedLocale, params: VideosListParams = {}): Promise<PaginatedResponse<LocalizedVideo>> {
  const raw: PaginatedResponse<Video> = await fetchPublic(listVideosEndpoint, { query: params, tags: [CacheTag.VIDEOS] });
  return localize(raw, locale);
}
