import type { ImageAsset, LocalizedString } from "@kira-joo/toolkit-common";

/**
 * Mirrors `GET /api/public/reviews` (paginated). Business rule enforced
 * server-side, not here: at least one of `content` text, `image`, or a
 * complete `beforeImage`+`afterImage` pair is present — never all fields,
 * so presentation code must handle every populated combination rather
 * than assuming one canonical shape (see docs/architecture.md).
 */
export interface Review {
  _id: string;
  content?: LocalizedString;
  authorName: LocalizedString;
  authorLabel: LocalizedString;
  image?: ImageAsset | null;
  beforeImage?: ImageAsset | null;
  afterImage?: ImageAsset | null;
  featured: boolean;
  sourceUrl?: string;
}

export interface ReviewsListParams {
  page?: number;
  limit?: number;
  search?: string;
}
