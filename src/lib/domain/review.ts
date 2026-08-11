import type { LocalizedResult, ImageAsset, LocalizedString } from "@kira-joo/toolkit-common";

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
  /** Absent on reviews created before this field existed — render without stars rather than fabricating one. */
  rating?: number;
  featured: boolean;
  sourceUrl?: string;
}

export interface ReviewsListParams {
  page?: number;
  limit?: number;
  search?: string;
}

/**
 * The shape this app actually renders: the raw contract above with every
 * bilingual field resolved to a plain string. Derived from the raw type
 * rather than hand-written, so the two can't drift.
 */
export type LocalizedReview = LocalizedResult<Review>;
