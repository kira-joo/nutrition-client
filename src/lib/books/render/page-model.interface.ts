/**
 * Adapted from nutrition-staff's `page-model.interface.ts` — simplified
 * for this app's block-granularity-only paginator (see `paginate-book.ts`):
 * no `richTextParagraphs`/table-row/list-item splitting fields, since
 * nothing here ever splits a block mid-way. `splittable` stays as a
 * field (rather than being removed outright) so the shape stays visibly
 * comparable to the server-side one; it is always `false`.
 */
export type FragmentKind = "content" | "chapterOpener" | "singlePage" | "tocReservation" | "pageBreakMarker" | "pageFooterNote";

export interface StreamFragment {
  id: string;
  kind: FragmentKind;
  html: string;
  chapterId: string | null;
  atomic: boolean;
  keepWithNext: boolean;
  forceNewPage: boolean;
  splittable: false;
  degrade?: "scaleImage";
  /** Only meaningful for `kind: "singlePage"` — which page-chrome class to render with, and whether it participates in folio numbering. */
  pageKind?: string;
  numbered?: boolean;
}

export interface RenderedPage {
  kind: string;
  chapterId: string | null;
  html: string;
  numbered: boolean;
  pageNumber: number | null;
}

export interface PaginationWarning {
  code: string;
  message: string;
}

export interface TocResultEntry {
  chapterId: string;
  title: string;
  /** The chapter's dynamic ordinal ("الفصل الأول", ...) — see `chapter-label.ts`. */
  label: string;
  /** The PRINTED folio shown in the TOC's own "...... 12" leader — null for a chapter landing on an unnumbered page (shouldn't normally happen, but stays honest if it does). Never use this for navigation; see `sequencePosition`. */
  pageNumber: number | null;
  /** The chapter opener's 1-based PHYSICAL position in `PaginationResult.pages` — always defined once resolved, unlike `pageNumber`. This is what the reader must navigate to; front-matter pages (cover, title, copyright) are real, reachable physical pages with no printed folio, so folio number and physical position are NOT the same axis once any unnumbered page exists before a chapter. */
  sequencePosition: number | null;
}

export interface PaginationResult {
  pageCount: number;
  pages: RenderedPage[];
  toc: TocResultEntry[];
  warnings: PaginationWarning[];
}
