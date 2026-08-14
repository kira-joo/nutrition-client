import type { ImageAsset } from "@kira-joo/toolkit-common";
import type { BookBackMatter, BookFrontMatter, BookReference, Chapter } from "@/lib/books/book-chapter.interface";

/**
 * Books are Arabic-only from the architecture up (nutrition-staff's
 * `book.schema.ts`: "plain Arabic string, deliberately NOT
 * LocalizedString") — there is nothing bilingual to resolve, so unlike
 * every other file in this directory, this domain type is a direct
 * passthrough of the wire shape, not a `LocalizedResult<T>` wrapper. A
 * deliberate deviation from the rest of `src/lib/domain/`, not an
 * oversight.
 */

export interface BookSocialLink {
  platform: string;
  url: string;
  order: number;
}

export interface BookContactBlock {
  phone?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
}

export interface BookPrintSettings {
  pageSize: "a5" | "a4";
  marginPreset: "compact" | "standard" | "generous";
  gutterMm: number;
  pageNumberStart: number;
  doublePageSpread: boolean;
}

/** `ResolvedBookIdentity` minus `sources` — the staff-only override/default provenance trail is never sent to the public API in the first place (see nutrition-staff's `buildPublicBookReaderPayload`). */
export interface PublicResolvedIdentity {
  doctorName: string;
  doctorTitle: string;
  doctorBio: string;
  doctorImage: ImageAsset | null;
  bookLogo: ImageAsset | null;
  websiteUrl: string | null;
  socialLinks: BookSocialLink[];
  contact: BookContactBlock;
  disclaimer: string;
  copyrightText: string;
  backCoverClosingText: string;
  backCoverAudienceText: string;
  qrDestination: string | null;
  print: BookPrintSettings;
  templateVersion: string;
}

export interface LocalizedStringLike {
  ar: string;
  en: string;
}

/** Mirrors nutrition-staff's `RecipeSnapshot` — everything a `RECIPE_REF` block needs, frozen at publish time. Only `.ar` fields are ever rendered (Arabic-only reader). */
export interface RecipeSnapshot {
  title: LocalizedStringLike;
  description: LocalizedStringLike;
  image: ImageAsset | null;
  ingredients: LocalizedStringLike[];
  instructions: LocalizedStringLike[];
  prepTime?: LocalizedStringLike;
  cookTime?: LocalizedStringLike;
  servings?: LocalizedStringLike;
}

export interface BookPdfAvailability {
  downloadAllowed: boolean;
  ready: boolean;
  pageCount?: number;
}

/** The exact wire shape of `GET /public/books/:slug` — mirrors nutrition-staff's `PublicBookReaderPayload` one-for-one. */
export interface Book {
  slug: string;
  shortDescription?: string;
  category?: string;

  title: string;
  subtitle?: string;
  coverImage: ImageAsset | null;
  backCoverImage: ImageAsset | null;
  resolvedSettings: PublicResolvedIdentity;
  content: {
    frontMatter: BookFrontMatter;
    chapters: Chapter[];
    backMatter: BookBackMatter;
    references: BookReference[];
  };
  recipeSnapshots: Record<string, RecipeSnapshot>;
  templateVersion: string;
  editionNumber: number;
  editionLabel?: string;
  publishedAt: string;

  allowFlipbook: boolean;
  pdf: BookPdfAvailability;
}

/**
 * The exact wire shape of `GET /public/books` (the listing, Phase I) —
 * mirrors nutrition-staff's `PublicBookListItem` one-for-one. Deliberately
 * NOT a subset of `Book`: `title`/`subtitle`/`coverImage` here come from
 * the book's current Edition (frozen at publish time, consistent with the
 * detail payload), while `shortDescription`/`category` are live Book
 * fields — nutrition-staff's own handler mixes both sources for exactly
 * this reason, so this type mixes them too rather than pretending it's a
 * trimmed-down `Book`.
 */
export interface PublicBookListItem {
  slug: string;
  title: string;
  subtitle?: string;
  coverImage: ImageAsset | null;
  shortDescription?: string;
  category?: string;
  editionCount: number;
  lastPublishedAt?: string;
}

export interface BooksListParams {
  page?: number;
  limit?: number;
}
