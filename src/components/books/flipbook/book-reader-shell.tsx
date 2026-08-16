"use client";
import { useCallback, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Book } from "@/lib/domain/book";
import { resolveGeometry } from "@/lib/books/render/geometry";
import { buildTemplateCss, CHAPTER_BACKGROUND_URL, FOOTER_LEAF_URL } from "@/lib/books/render/template-css";
import { prefersReducedMotion } from "@/lib/animation/gsap-config";
import { useRouter, usePathname } from "@/i18n/navigation";
import type { FlipEngineHandle } from "@/lib/books/flip-engine/flip-engine.interface";
import { StPageFlipEngine } from "@/lib/books/flip-engine/stpageflip-engine";
import { useBookPagination } from "./use-book-pagination";
import { useReaderKeyboard } from "./use-reader-keyboard";
import { useIsMobileViewport } from "./use-is-mobile-viewport";
import { usePageTurnSound } from "./use-page-turn-sound";
import { useShareBook } from "./use-share-book";
import { useBookBookmark } from "./use-book-bookmark";
import { useBookSearch } from "./use-book-search";
import { FlipbookControls } from "./flipbook-controls";
import { BookImmersiveChrome } from "./book-immersive-chrome";
import { BookTocPanel } from "./book-toc-panel";

const IMMERSIVE_QUERY_KEY = "read";
const IMMERSIVE_MAX_SCALE = 3;
const IMMERSIVE_FILL_RATIO = 0.94;

/**
 * The reader's one stateful "brain": pagination, Book Interaction
 * (immersive) mode, TOC, search, bookmark, share, and sound all live
 * here. The physical page turn itself lives entirely behind
 * `FlipEngineProps`/`FlipEngineHandle` — this file never imports
 * `page-flip`, and swapping the engine would not touch it.
 *
 * Division of authority over the current page: while mounted, the engine
 * owns it (it is mid-animation half the time), and `currentPageNumber`
 * here is a read-only MIRROR the engine pushes through `onPageChange`,
 * used only to render chrome. Nothing writes to it directly; every move
 * goes through `engineRef`, so there is exactly one navigation path.
 *
 * The same engine is rendered once for page mode and once inside
 * `book-immersive-chrome.tsx` — never both at once, so they safely share
 * one ref.
 */
export function BookReaderShell({ book }: { book: Book }) {
  const { pagination, status } = useBookPagination(book);
  const geometry = useMemo(() => resolveGeometry(book.resolvedSettings.print), [book.resolvedSettings.print]);
  // The watermark comes from the Edition's frozen `resolvedSettings`, so a
  // published book always renders the watermark it was published with —
  // never today's Book Settings. Same option shape nutrition-staff passes,
  // so Preview, Flipbook and PDF share one implementation.
  const watermark = book.resolvedSettings.pageWatermark;
  const css = useMemo(
    () =>
      buildTemplateCss(geometry, {
        chapterBackgroundUrl: CHAPTER_BACKGROUND_URL,
        footerLeafUrl: FOOTER_LEAF_URL,
        pageWatermark: watermark?.image?.secureUrl
          ? { url: watermark.image.secureUrl, opacity: watermark.opacity, scaleMm: watermark.scaleMm }
          : undefined,
      }),
    [geometry, watermark]
  );

  const isNarrowViewport = useIsMobileViewport();
  const sound = usePageTurnSound();
  const share = useShareBook(book.title);
  const search = useBookSearch(pagination);

  const [tocOpen, setTocOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  // "auto" follows the viewport; an explicit choice overrides it
  // regardless of width — the toolbar's spread/single toggle exists
  // specifically so a visitor can choose single-page on a wide screen or
  // (width permitting) force a spread on a narrower one. `isMobile` stays
  // the name used downstream since its real meaning has always been "show
  // one page, not two", not literally "is this a phone".
  const [viewModeOverride, setViewModeOverride] = useState<"auto" | "single" | "spread">("auto");
  const isMobile = viewModeOverride === "auto" ? isNarrowViewport : viewModeOverride === "single";

  // Resolved once on the client (React re-runs lazy initializers during
  // hydration, so the server's conservative `true` never sticks). It
  // feeds behaviour, never markup, so it cannot cause a mismatch.
  const [reducedMotion] = useState(() => prefersReducedMotion());

  const [currentPageNumber, setCurrentPageNumber] = useState(1);
  const engineRef = useRef<FlipEngineHandle>(null);

  const pageCount = pagination?.pageCount ?? 0;

  const goNext = useCallback(() => engineRef.current?.next(), []);
  const goPrev = useCallback(() => engineRef.current?.prev(), []);
  const goToPage = useCallback((pageNumber: number) => engineRef.current?.goTo(pageNumber), []);
  const goToStart = useCallback(() => engineRef.current?.goTo(1), []);
  const goToEnd = useCallback(() => engineRef.current?.goTo(pageCount), [pageCount]);

  useReaderKeyboard({ onNext: goNext, onPrev: goPrev, onGoToStart: goToStart, onGoToEnd: goToEnd });

  const bookmark = useBookBookmark(book.slug, currentPageNumber);

  // A TOC row rendered inside a page's own HTML. The engine reports the
  // chapter id and nothing more; resolving it to a physical page is the
  // reader's job, using the same `sequencePosition` the TOC panel uses —
  // never `pageNumber` (the printed folio), which is `null` for the
  // cover/title/copyright pages and diverges from physical position as
  // soon as any unnumbered page precedes a chapter.
  const handleTocLinkClick = useCallback(
    (chapterId: string) => {
      const entry = pagination?.toc.find((item) => item.chapterId === chapterId);
      if (entry?.sequencePosition) goToPage(entry.sequencePosition);
    },
    [pagination, goToPage]
  );

  // Book Interaction mode, URL-addressable via `?read=1`: share links land
  // a recipient straight into reading mode, the browser Back button exits
  // it (what a visitor expects, especially on mobile), and a reload keeps
  // it. `router.replace` (not `push`) so entering/exiting doesn't pile up
  // history entries for every toggle.
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isImmersive = searchParams.get(IMMERSIVE_QUERY_KEY) === "1";

  const enterImmersive = useCallback(() => {
    const next = new URLSearchParams(searchParams.toString());
    next.set(IMMERSIVE_QUERY_KEY, "1");
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  }, [pathname, router, searchParams]);

  const exitImmersive = useCallback(() => {
    const next = new URLSearchParams(searchParams.toString());
    next.delete(IMMERSIVE_QUERY_KEY);
    const queryString = next.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  // Escape (routed here from `useDialogA11y` via `book-immersive-chrome`'s
  // `onRequestClose`) closes the TOC first if it's open, matching how a
  // real nested dialog should unwind one layer at a time rather than
  // dropping straight out of Book Interaction mode entirely.
  const handleImmersiveClose = useCallback(() => {
    if (tocOpen) {
      setTocOpen(false);
      return;
    }
    exitImmersive();
  }, [tocOpen, exitImmersive]);

  function renderEngine(options: { maxScale: number; fillRatio: number; fillContainer: boolean }) {
    if (status === "error") {
      return (
        <p className="p-8 text-center text-sm text-slate-500" dir="rtl">
          حدث خطأ أثناء تجهيز الكتاب. يرجى إعادة تحميل الصفحة.
        </p>
      );
    }
    if (status === "loading" || !pagination) {
      return (
        <p className="p-8 text-center text-sm text-slate-500" dir="rtl">
          جاري تحضير الكتاب…
        </p>
      );
    }
    return (
      <StPageFlipEngine
        ref={engineRef}
        pages={pagination.pages}
        geometry={geometry}
        // Read once per engine mount — the engine owns the page from then
        // on. Passing the live mirror back in would put two authorities
        // on the same number and fight the in-flight animation.
        initialPageNumber={currentPageNumber}
        singlePage={isMobile}
        reducedMotion={reducedMotion}
        zoom={zoom}
        maxScale={options.maxScale}
        fillRatio={options.fillRatio}
        fillContainer={options.fillContainer}
        onPageChange={setCurrentPageNumber}
        onTurnStart={sound.play}
        onTocLinkClick={handleTocLinkClick}
      />
    );
  }

  return (
    <>
      {/*
        Mounted UNCONDITIONALLY, and deliberately here rather than inside
        the flip engine. `paginateBook` is measurement-based: it lays out
        real DOM against this exact stylesheet, and it runs from
        `useBookPagination`'s effect one tick after this first render —
        while `status` is still "loading" and no engine is mounted yet.
        Injecting it from the engine (as an earlier version did) meant the
        paginator measured a `.book-page` with no width, height, padding or
        type at all: `measureContentBoxPx()` returned 0x0, so no fragment
        ever "fit" and every single one got its own page — a 66-block book
        exploded to 94 near-empty pages. The `@font-face` rules live here
        too, so `ensureFontsReady()` is equally dependent on it.

        `dangerouslySetInnerHTML`, not `<style>{css}</style>`: the CSS
        contains `"` inside its `@font-face` rules, and React escapes text
        children of a `<style>` differently on the server than the client,
        which hydration-mismatches the whole reader.
      */}
      <style dangerouslySetInnerHTML={{ __html: css }} />

      {!isImmersive && (
        <div className="flex flex-col gap-3">
          {renderEngine({ maxScale: 1, fillRatio: 1, fillContainer: false })}
          <FlipbookControls
            currentPageNumber={currentPageNumber}
            pageCount={pageCount}
            onNext={goNext}
            onPrev={goPrev}
            onGoToPage={goToPage}
            onOpenToc={() => setTocOpen(true)}
            pdf={book.pdf}
            bookSlug={book.slug}
            onEnterImmersive={enterImmersive}
          />
        </div>
      )}

      {isImmersive && (
        <BookImmersiveChrome
          bookTitle={book.title}
          doctorName={book.resolvedSettings.doctorName}
          currentPageNumber={currentPageNumber}
          pageCount={pageCount}
          onNext={goNext}
          onPrev={goPrev}
          onGoToPage={goToPage}
          onGoToStart={goToStart}
          onGoToEnd={goToEnd}
          onOpenToc={() => setTocOpen(true)}
          tocOpen={tocOpen}
          zoom={zoom}
          onZoomChange={setZoom}
          soundEnabled={sound.enabled}
          onToggleSound={sound.toggle}
          onShare={share.share}
          shareCopied={share.copied}
          pdf={book.pdf}
          bookSlug={book.slug}
          onRequestClose={handleImmersiveClose}
          viewMode={isMobile ? "single" : "spread"}
          onViewModeChange={setViewModeOverride}
          isBookmarked={bookmark.isBookmarked}
          onToggleBookmark={bookmark.toggle}
          searchQuery={search.query}
          onSearchQueryChange={search.setQuery}
          searchResults={search.results}
          onSearchSelect={goToPage}
        >
          {renderEngine({ maxScale: IMMERSIVE_MAX_SCALE, fillRatio: IMMERSIVE_FILL_RATIO, fillContainer: true })}
        </BookImmersiveChrome>
      )}

      <BookTocPanel
        open={tocOpen}
        onClose={() => setTocOpen(false)}
        toc={pagination?.toc ?? []}
        onSelect={(sequencePosition) => {
          if (sequencePosition !== null) goToPage(sequencePosition);
          setTocOpen(false);
        }}
        isNested={isImmersive}
      />
    </>
  );
}
