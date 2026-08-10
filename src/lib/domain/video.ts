import type { LocalizedResult, ImageAsset, LocalizedString, VideoAsset } from "@kira-joo/toolkit-common";

/**
 * Mirrors `GET /api/public/videos` (list, paginated) and
 * `GET /api/public/videos/[id]` (detail). At least one of `video`/
 * `externalUrl` is present, enforced server-side. `description` is
 * optional — it was added after every existing video, so it's absent on
 * anything staff hasn't re-authored yet.
 */
export interface Video {
  _id: string;
  title: LocalizedString;
  description?: LocalizedString;
  video?: VideoAsset | null;
  externalUrl?: string;
  poster?: ImageAsset | null;
}

export interface VideosListParams {
  page?: number;
  limit?: number;
  search?: string;
}

/**
 * The shape this app actually renders: the raw contract above with every
 * bilingual field resolved to a plain string. Derived from the raw type
 * rather than hand-written, so the two can't drift.
 */
export type LocalizedVideo = LocalizedResult<Video>;
