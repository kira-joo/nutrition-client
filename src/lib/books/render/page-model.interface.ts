/**
 * Adapted from nutrition-staff's `page-model.interface.ts` — simplified
 * for this app's block-granularity-only paginator (see `paginate-book.ts`):
 * no `richTextParagraphs`/table-row/list-item splitting fields, since
 * nothing here ever splits a block mid-way. `splittable` stays as a
 * field (rather than being removed outright) so the shape stays visibly
 * comparable to the server-side one; it is always `false`.
 */
export type FragmentKind = "content" | "chapterOpener" | "singlePage" | "tocReservation" | "pageBreakMarker";

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
  pageNumber: number | null;
}

export interface PaginationResult {
  pageCount: number;
  pages: RenderedPage[];
  toc: TocResultEntry[];
  warnings: PaginationWarning[];
}
