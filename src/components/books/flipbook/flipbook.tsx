"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Book } from "@/lib/domain/book";
import { resolveGeometry } from "@/lib/books/render/geometry";
import { buildTemplateCss } from "@/lib/books/render/template-css";
import { spreadFor } from "@/lib/books/render/book-physical-order";
import { prefersReducedMotion } from "@/lib/animation/gsap-config";
import type { RenderedPage } from "@/lib/books/render/page-model.interface";
import { useBookPagination } from "./use-book-pagination";
import { useFlipbookNavigation } from "./use-flipbook-navigation";
import { useIsMobileViewport } from "./use-is-mobile-viewport";
import { useFitScale } from "./use-fit-scale";
import { usePageTurnSound } from "./use-page-turn-sound";
import { FlipbookControls } from "./flipbook-controls";
import { TocDrawer } from "./toc-drawer";

const TURN_DURATION_MS = 550;

interface TurningLeaf {
  side: "left" | "right";
  html: string;
  direction: "forward" | "backward";
}

export function Flipbook({ book }: { book: Book }) {
  const { pagination, status } = useBookPagination(book);
  const geometry = useMemo(() => resolveGeometry(book.resolvedSettings.print), [book.resolvedSettings.print]);
  const css = useMemo(() => buildTemplateCss(geometry), [geometry]);

  const isMobile = useIsMobileViewport();
  const sound = usePageTurnSound();
  const [tocOpen, setTocOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [turningLeaf, setTurningLeaf] = useState<TurningLeaf | null>(null);
  const turnTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentPageNumberRef = useRef(1);

  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const pageCount = pagination?.pageCount ?? 0;

  const pagesByNumber = useMemo(() => {
    const map = new Map<number, RenderedPage>();
    pagination?.pages.forEach((page) => {
      if (page.pageNumber !== null) map.set(page.pageNumber, page);
    });
    return map;
  }, [pagination]);

  const { currentPageNumber, goNext, goPrev, goToPage, goToStart, goToEnd, onTouchStart, onTouchEnd } = useFlipbookNavigation({
    pageCount,
    getStepSize: () => (isMobile ? 1 : 2),
    onBeforeNavigate: (direction) => {
      if (prefersReducedMotion()) return; // reduced motion: swap instantly, no leaf overlay at all
      const turningSide: "left" | "right" = direction === "forward" ? "left" : "right";
      const pageNumberOnTurningSide = isMobile ? currentPageNumberRef.current : spreadFor(currentPageNumberRef.current)[turningSide];
      const html = pageNumberOnTurningSide !== null ? pagesByNumber.get(pageNumberOnTurningSide)?.html ?? "" : "";
      setTurningLeaf({ side: turningSide, html, direction });
      sound.play();
      if (turnTimeoutRef.current) clearTimeout(turnTimeoutRef.current);
      turnTimeoutRef.current = setTimeout(() => setTurningLeaf(null), TURN_DURATION_MS);
    },
  });

  currentPageNumberRef.current = currentPageNumber;

  useEffect(
    () => () => {
      if (turnTimeoutRef.current) clearTimeout(turnTimeoutRef.current);
    },
    []
  );

  useEffect(() => {
    function onFullscreenChange() {
      setIsFullscreen(document.fullscreenElement === rootRef.current);
    }
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  // Event delegation for clickable TOC entries rendered INSIDE a page's
  // own HTML (the reserved TOC pages — see paginate-book.ts's
  // `fillTocPages`, which stamps `data-toc-chapter-id` on each row).
  useEffect(() => {
    function onClick(event: MouseEvent): void {
      const target = event.target as HTMLElement;
      const entry = target.closest<HTMLElement>("[data-toc-chapter-id]");
      if (!entry || !pagination) return;
      const chapterId = entry.getAttribute("data-toc-chapter-id");
      const tocEntry = pagination.toc.find((item) => item.chapterId === chapterId);
      if (tocEntry?.pageNumber) goToPage(tocEntry.pageNumber);
    }
    const content = contentRef.current;
    content?.addEventListener("click", onClick);
    return () => content?.removeEventListener("click", onClick);
  }, [pagination, goToPage]);

  const fitScale = useFitScale(stageRef, contentRef, [pageCount, isMobile]) * zoom;

  async function toggleFullscreen(): Promise<void> {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }
    await rootRef.current?.requestFullscreen();
  }

  if (status === "error") {
    return (
      <p className="p-8 text-center text-sm text-slate-500" dir="rtl">
        حدث خطأ أثناء تجهيز الكتاب. يرجى إعادة تحميل الصفحة.
      </p>
    );
  }

  const spread = isMobile ? null : spreadFor(currentPageNumber);
  // spread.right is always <= currentPageNumber <= pageCount, but spread.left
  // (right + 1) can overflow pageCount when the book's total page count is
  // even — the last page then has no pair and must render alone, exactly
  // like the cover, rather than showing a folio for a page that was never
  // generated.
  const leftPageNumber = spread?.left !== null && spread?.left !== undefined && spread.left <= pageCount ? spread.left : null;
  const rightPageNumber = spread?.left === null || spread === null ? currentPageNumber : spread.right ?? currentPageNumber;
  const showTwoPages = !isMobile && leftPageNumber !== null;

  return (
    <div ref={rootRef} className="book-page-scope flex flex-col gap-3 bg-slate-100 dark:bg-slate-900" dir="rtl">
      <style>{css}</style>
      <style>{`
        @keyframes book-leaf-turn-forward { from { transform: rotateY(0deg); } to { transform: rotateY(-160deg); } }
        @keyframes book-leaf-turn-backward { from { transform: rotateY(0deg); } to { transform: rotateY(160deg); } }
      `}</style>

      <div ref={stageRef} className="relative flex h-[70vh] min-h-[420px] items-center justify-center overflow-hidden" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        {status === "loading" || !pagination ? (
          <p className="text-sm text-slate-500" dir="rtl">
            جاري تحضير الكتاب…
          </p>
        ) : (
          <div ref={contentRef} style={{ transform: `scale(${fitScale})` }}>
            <div
              className="relative"
              style={{
                width: showTwoPages ? `${geometry.widthMm * 2}mm` : `${geometry.widthMm}mm`,
                height: `${geometry.heightMm}mm`,
                perspective: "2400px",
              }}
            >
              <PageSlot side="right" pageWidthMm={geometry.widthMm} html={pagesByNumber.get(rightPageNumber)?.html ?? ""} pageNumber={rightPageNumber} />
              {leftPageNumber !== null ? <PageSlot side="left" pageWidthMm={geometry.widthMm} html={pagesByNumber.get(leftPageNumber)?.html ?? ""} pageNumber={leftPageNumber} /> : null}

              {turningLeaf ? (
                <div
                  className="absolute top-0 book-page"
                  data-side={turningLeaf.side}
                  style={{
                    [turningLeaf.side]: 0,
                    width: `${geometry.widthMm}mm`,
                    height: `${geometry.heightMm}mm`,
                    transformOrigin: turningLeaf.side === "left" ? "right center" : "left center",
                    backfaceVisibility: "hidden",
                    animation: `book-leaf-turn-${turningLeaf.direction} ${TURN_DURATION_MS}ms ease-in-out forwards`,
                    boxShadow: "0 0 12px rgba(0,0,0,0.25)",
                    zIndex: 5,
                  }}
                >
                  <div className="book-page-content" dangerouslySetInnerHTML={{ __html: turningLeaf.html }} />
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>

      <FlipbookControls
        currentPageNumber={currentPageNumber}
        pageCount={pageCount}
        onNext={goNext}
        onPrev={goPrev}
        onGoToPage={goToPage}
        onGoToStart={goToStart}
        onGoToEnd={goToEnd}
        onOpenToc={() => setTocOpen(true)}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        zoom={zoom}
        onZoomChange={setZoom}
        soundEnabled={sound.enabled}
        onToggleSound={sound.toggle}
        pdf={book.pdf}
        bookSlug={book.slug}
      />

      <TocDrawer
        open={tocOpen}
        onClose={() => setTocOpen(false)}
        toc={pagination?.toc ?? []}
        onSelect={(pageNumber: number | null) => {
          if (pageNumber !== null) goToPage(pageNumber);
          setTocOpen(false);
        }}
      />
    </div>
  );
}

function PageSlot({ side, pageWidthMm, html, pageNumber }: { side: "left" | "right"; pageWidthMm: number; html: string; pageNumber: number }) {
  return (
    <div className="absolute top-0 book-page" data-side={side} data-page-number={pageNumber} style={{ [side]: 0, width: `${pageWidthMm}mm`, height: "100%" }}>
      <div className="book-page-content" dangerouslySetInnerHTML={{ __html: html }} />
      <div className="book-folio">{pageNumber}</div>
    </div>
  );
}
