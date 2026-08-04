import type { ImageAsset, LocalizedString, VideoAsset } from "@kira-joo/toolkit-common";

/** Mirrors `GET /api/public/videos` (paginated). At least one of `video`/`externalUrl` is present, enforced server-side. */
export interface Video {
  _id: string;
  title: LocalizedString;
  video?: VideoAsset | null;
  externalUrl?: string;
  poster?: ImageAsset | null;
}

export interface VideosListParams {
  page?: number;
  limit?: number;
  search?: string;
}
