import type { BookPrintSettings } from "@/lib/domain/book";

/**
 * Hand-synced from nutrition-staff's
 * `src/server/books/render/dr-omnia-book-v1/geometry.ts` — same exact
 * mm values, adapted only to take the plain string literal types the
 * public API's `resolvedSettings.print` already carries (nutrition-staff
 * imports its own `BookPageSize`/`BookMarginPreset` enums for the same
 * values; this app never needs those enums for anything else, so the
 * literal union in `BookPrintSettings` is enough).
 */
export const PAGE_SIZE_MM: Record<BookPrintSettings["pageSize"], { widthMm: number; heightMm: number }> = {
  a5: { widthMm: 148, heightMm: 210 },
  a4: { widthMm: 210, heightMm: 297 },
};

export const MARGIN_PRESET_MM: Record<BookPrintSettings["marginPreset"], { topMm: number; bottomMm: number; outerMm: number }> = {
  compact: { topMm: 14, bottomMm: 16, outerMm: 12 },
  standard: { topMm: 16, bottomMm: 18, outerMm: 14 },
  generous: { topMm: 20, bottomMm: 22, outerMm: 18 },
};

export interface ResolvedGeometry {
  widthMm: number;
  heightMm: number;
  topMm: number;
  bottomMm: number;
  outerMm: number;
  gutterMm: number;
  contentWidthMm: number;
  contentHeightMm: number;
}

export function resolveGeometry(print: BookPrintSettings): ResolvedGeometry {
  const size = PAGE_SIZE_MM[print.pageSize];
  const margins = MARGIN_PRESET_MM[print.marginPreset];
  return {
    widthMm: size.widthMm,
    heightMm: size.heightMm,
    topMm: margins.topMm,
    bottomMm: margins.bottomMm,
    outerMm: margins.outerMm,
    gutterMm: print.gutterMm,
    contentWidthMm: size.widthMm - margins.outerMm - print.gutterMm,
    contentHeightMm: size.heightMm - margins.topMm - margins.bottomMm,
  };
}
