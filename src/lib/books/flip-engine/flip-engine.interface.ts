import type { ResolvedGeometry } from "@/lib/books/render/geometry";
import type { RenderedPage } from "@/lib/books/render/page-model.interface";

/**
 * The boundary between the Book System and whatever library actually
 * performs the physical page turn.
 *
 * Everything upstream of this interface — immutable Edition data, the
 * Book template, pagination, A5 page generation, TOC, page metadata, PDF
 * generation, Book Interaction chrome, and the cache/public data
 * architecture — is engine-agnostic and must stay that way. A flip engine
 * consumes `RenderedPage[]` and owns exactly four things: physical spread
 * presentation, page-turn interaction, drag/touch behaviour, and the
 * page-transition animation.
 *
 * Replacing `StPageFlipEngine` therefore means writing one new component
 * against this file, with no changes to pagination, content rendering,
 * Edition logic, PDF, or the rest of the reader.
 */
export interface FlipEngineProps {
  /**
   * The book's physical pages in reading order — `pages[0]` is physical
   * position 1. This is the paginator's own output (see
   * `paginate-book.ts`), passed through untouched; an engine may
   * normalise its OWN internal deck (see `StPageFlipEngine`'s parity
   * padding) but must never change what these page numbers mean to the
   * caller.
   */
  pages: RenderedPage[];
  geometry: ResolvedGeometry;
  /** The print template's CSS. The engine injects it so page HTML renders identically to the PDF. */
  css: string;
  /**
   * Where to open the book. Read ONCE per engine mount and deliberately
   * NOT a controlled prop: while mounted, the engine is the single source
   * of truth for the current physical page, reporting every change
   * through `onPageChange`. Feeding a controlled value back in would put
   * two authorities on the same number and fight the in-flight animation.
   * Callers move the book with `FlipEngineHandle`, never by re-rendering.
   */
  initialPageNumber: number;
  /** One page at a time instead of a two-page spread — the caller's resolved decision, never re-derived from the viewport here. */
  singlePage: boolean;
  /** Replaces the physical fold with an instant page change. */
  reducedMotion: boolean;
  /** Magnification above the fitted size. `1` fits the available space. */
  zoom: number;
  /** Upper bound on scale relative to the page's real printed size. Page mode passes `1` (never larger than life); Book Interaction mode raises it. */
  maxScale: number;
  /** Multiplier leaving deliberate breathing room around the book inside its stage. */
  fillRatio: number;
  /** Fill the parent's full computed height (Book Interaction mode) rather than sitting in a bounded stage (page mode). */
  fillContainer: boolean;
  /** Fired whenever the book settles on a new physical page — the caller mirrors this into its own state for chrome. */
  onPageChange: (pageNumber: number) => void;
  /** Fired the moment a turn starts moving, for the page-turn sound. The engine owns no audio itself. */
  onTurnStart: () => void;
  /** A TOC row inside a rendered page's own HTML was clicked. The engine resolves nothing — the caller maps the chapter to a page. */
  onTocLinkClick: (chapterId: string) => void;
}

/**
 * Imperative navigation. Deliberately imperative rather than prop-driven:
 * a page turn is an event ("turn now"), not a state to be reconciled, and
 * the engine must be free to animate it on its own clock.
 */
export interface FlipEngineHandle {
  next(): void;
  prev(): void;
  goTo(pageNumber: number): void;
}
