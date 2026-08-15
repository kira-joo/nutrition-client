"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Columns2,
  Download,
  HelpCircle,
  List,
  Maximize,
  Minimize,
  Search,
  Share2,
  SkipBack,
  SkipForward,
  Square,
  Volume2,
  VolumeX,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { Portal } from "@kira-joo/frontend-toolkit-tailwind/primitives";
import { useDialogA11y } from "@/lib/a11y/use-dialog-a11y";
import { prefersReducedMotion } from "@/lib/animation/gsap-config";
import { spreadFor } from "@/lib/books/render/book-physical-order";
import type { BookPdfAvailability } from "@/lib/domain/book";
import { useIdleVisibility } from "./use-idle-visibility";
import type { BookSearchResult } from "./use-book-search";

const ZOOM_STEP = 0.25;
const ZOOM_MIN = 1;
const ZOOM_MAX = 2.5;
const CHROME_FADE_MS = 300;

export interface BookImmersiveChromeProps {
  bookTitle: string;
  doctorName: string;
  currentPageNumber: number;
  pageCount: number;
  onNext: () => void;
  onPrev: () => void;
  onGoToPage: (pageNumber: number) => void;
  onGoToStart: () => void;
  onGoToEnd: () => void;
  onOpenToc: () => void;
  /** Suspends the idle-fade timer — the toolbar must stay put while the TOC panel is open over it. */
  tocOpen: boolean;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onShare: () => void;
  shareCopied: boolean;
  pdf: BookPdfAvailability;
  bookSlug: string;
  /**
   * Routes Escape through the shell's own logic (close the TOC first if
   * it's open, otherwise exit Book Interaction mode entirely) — this
   * component never decides that policy itself.
   */
  onRequestClose: () => void;
  /** The EFFECTIVE mode after the shell resolves "auto" against the real viewport — this component only ever renders one of the two, never the tri-state. */
  viewMode: "single" | "spread";
  onViewModeChange: (mode: "auto" | "single" | "spread") => void;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  searchResults: BookSearchResult[];
  onSearchSelect: (sequencePosition: number) => void;
  children: ReactNode;
}

/**
 * "Start a presentation" for the book: the whole site chrome disappears
 * behind this, a deep green field replaces it, and the book (passed in as
 * `children` — the same `Flipbook` surface page mode uses) gets as much
 * of the viewport as `use-fit-scale.ts`'s raised `maxScale`/`fillRatio`
 * allow. `useDialogA11y`'s existing `BACKGROUND_SELECTOR` ("main, footer,
 * header") already inerts the real site chrome for keyboard/AT the moment
 * this opens — no separate chrome-suppression mechanism was needed.
 *
 * Fullscreen, unlike the rest of the reader, is entirely local to this
 * component: it's only ever offered in Book Interaction mode, so there's
 * no cross-mode state to share.
 *
 * Layout follows the approved reference: a compact top bar (exit,
 * spread/single toggle, zoom, centered title+doctor, bookmark, share,
 * search, TOC), large floating side arrows around the book itself, and a
 * compact bottom bar (first/prev/indicator/next/last, sound, help,
 * fullscreen, PDF).
 */
export function BookImmersiveChrome({
  bookTitle,
  doctorName,
  currentPageNumber,
  pageCount,
  onNext,
  onPrev,
  onGoToPage,
  onGoToStart,
  onGoToEnd,
  onOpenToc,
  tocOpen,
  zoom,
  onZoomChange,
  soundEnabled,
  onToggleSound,
  onShare,
  shareCopied,
  pdf,
  bookSlug,
  onRequestClose,
  viewMode,
  onViewModeChange,
  isBookmarked,
  onToggleBookmark,
  searchQuery,
  onSearchQueryChange,
  searchResults,
  onSearchSelect,
  children,
}: BookImmersiveChromeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);
  useDialogA11y({ isOpen: true, onClose: onRequestClose, containerRef, ready: isMounted });

  const [isFullscreen, setIsFullscreen] = useState(false);
  useEffect(() => {
    function onFullscreenChange() {
      setIsFullscreen(document.fullscreenElement === containerRef.current);
    }
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  async function toggleFullscreen(): Promise<void> {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }
    await containerRef.current?.requestFullscreen();
  }

  const [searchOpen, setSearchOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const { isVisible, onChromeFocus, onChromeBlur } = useIdleVisibility({ suspended: tocOpen || searchOpen || helpOpen });
  const fadeTransition = prefersReducedMotion() ? "none" : `opacity ${CHROME_FADE_MS}ms ease-in-out`;
  const chromeStyle: React.CSSProperties = { opacity: isVisible ? 1 : 0, transition: fadeTransition, pointerEvents: isVisible ? "auto" : "none" };

  const [pageJumpValue, setPageJumpValue] = useState("");
  function submitPageJump(): void {
    const parsed = Number(pageJumpValue);
    if (Number.isFinite(parsed) && parsed >= 1 && parsed <= pageCount) onGoToPage(parsed);
    setPageJumpValue("");
  }

  const canDownloadPdf = pdf.downloadAllowed && pdf.ready;
  const iconButtonClass =
    "flex size-touch-min items-center justify-center rounded-full text-white/90 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent";
  const activeIconButtonClass = "flex size-touch-min items-center justify-center rounded-full bg-white/20 text-white";

  // Same "...... 12" range the print/PDF spread pairing already uses —
  // computed here purely for the indicator's display text, independent of
  // whatever `Flipbook` itself resolves for rendering.
  const spread = viewMode === "spread" ? spreadFor(currentPageNumber) : null;
  const pageIndicatorText =
    spread && spread.left !== null && spread.left <= pageCount ? `${spread.right} - ${spread.left}` : String(currentPageNumber);

  return (
    <Portal>
      <div ref={containerRef} role="dialog" aria-modal="true" aria-label={bookTitle} dir="rtl" className="fixed inset-0 z-modal flex h-dvh flex-col bg-[#0f3a32]">
        {/* Top bar — exit / spread-toggle+zoom / centered identity / bookmark+share+search+TOC */}
        <div
          className="grid shrink-0 grid-cols-[auto_1fr_auto] items-center gap-2 px-3 py-2.5 sm:px-6"
          style={chromeStyle}
          onFocus={onChromeFocus}
          onBlur={onChromeBlur}
        >
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onRequestClose}
              className="flex items-center gap-2 rounded-full px-2.5 py-2 text-sm font-medium text-white/90 transition-colors hover:bg-white/10 hover:text-white sm:px-3"
            >
              <X className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">إنهاء وضع القراءة التفاعلية</span>
            </button>
            <span className="mx-1 hidden h-5 w-px bg-white/15 sm:block" aria-hidden="true" />
            <button
              type="button"
              aria-label="عرض صفحة واحدة"
              title="عرض صفحة واحدة"
              onClick={() => onViewModeChange("single")}
              className={viewMode === "single" ? activeIconButtonClass : iconButtonClass}
            >
              <Square className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="عرض صفحتين"
              title="عرض صفحتين"
              onClick={() => onViewModeChange("spread")}
              className={viewMode === "spread" ? activeIconButtonClass : iconButtonClass}
            >
              <Columns2 className="h-4 w-4" aria-hidden="true" />
            </button>
            <span className="mx-1 hidden h-5 w-px bg-white/15 sm:block" aria-hidden="true" />
            <button type="button" aria-label="تصغير" title="تصغير" onClick={() => onZoomChange(Math.max(ZOOM_MIN, zoom - ZOOM_STEP))} disabled={zoom <= ZOOM_MIN} className={`hidden sm:flex ${iconButtonClass}`}>
              <ZoomOut className="h-4 w-4" aria-hidden="true" />
            </button>
            <span className="hidden min-w-[3rem] text-center text-xs text-white/70 sm:inline">{Math.round(zoom * 100)}%</span>
            <button type="button" aria-label="تكبير" title="تكبير" onClick={() => onZoomChange(Math.min(ZOOM_MAX, zoom + ZOOM_STEP))} disabled={zoom >= ZOOM_MAX} className={`hidden sm:flex ${iconButtonClass}`}>
              <ZoomIn className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div className="flex min-w-0 flex-col items-center text-center">
            <span className="w-full truncate text-sm font-medium text-white">{bookTitle}</span>
            {doctorName ? <span className="w-full truncate text-xs text-white/60">{doctorName}</span> : null}
          </div>

          <div className="flex items-center justify-end gap-1">
            <button
              type="button"
              aria-label={isBookmarked ? "إزالة الإشارة المرجعية" : "إضافة إشارة مرجعية لهذه الصفحة"}
              title={isBookmarked ? "إزالة الإشارة المرجعية" : "إضافة إشارة مرجعية"}
              onClick={onToggleBookmark}
              className={isBookmarked ? activeIconButtonClass : iconButtonClass}
            >
              <Bookmark className="h-4 w-4" aria-hidden="true" fill={isBookmarked ? "currentColor" : "none"} />
            </button>
            <button type="button" aria-label="مشاركة الكتاب" title={shareCopied ? "تم نسخ الرابط" : "مشاركة الكتاب"} onClick={onShare} className={iconButtonClass}>
              <Share2 className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="بحث في الكتاب"
              title="بحث في الكتاب"
              onClick={() => setSearchOpen((value) => !value)}
              className={searchOpen ? activeIconButtonClass : iconButtonClass}
            >
              <Search className="h-4 w-4" aria-hidden="true" />
            </button>
            <button type="button" aria-label="فهرس الكتاب" title="فهرس الكتاب" onClick={onOpenToc} className={iconButtonClass}>
              <List className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Search — a real inline panel, not a second Portal; suspends idle-fade while open (see useIdleVisibility above) */}
        {searchOpen ? (
          <div className="mx-3 mb-1 shrink-0 rounded-lg bg-black/30 p-3 sm:mx-6" style={chromeStyle} onFocus={onChromeFocus} onBlur={onChromeBlur}>
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(event) => onSearchQueryChange(event.target.value)}
              placeholder="ابحث في نص الكتاب..."
              aria-label="بحث في نص الكتاب"
              className="w-full rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/40"
            />
            {searchQuery.trim().length > 1 ? (
              <div className="mt-2 max-h-48 overflow-y-auto rounded-md bg-black/20">
                {searchResults.length === 0 ? (
                  <p className="p-3 text-center text-sm text-white/60">لا توجد نتائج.</p>
                ) : (
                  <ul>
                    {searchResults.map((result) => (
                      <li key={result.sequencePosition}>
                        <button
                          type="button"
                          onClick={() => {
                            onSearchSelect(result.sequencePosition);
                            setSearchOpen(false);
                          }}
                          className="w-full px-3 py-2 text-right text-sm text-white/90 hover:bg-white/10"
                        >
                          {result.snippet}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : null}
          </div>
        ) : null}

        {/* Stage: edge arrows + the book surface (children) */}
        <div className="relative min-h-0 flex-1 px-2 sm:px-4">
          {/*
            "Next" (forward, deeper into the book) sits on the PHYSICAL
            LEFT edge — matching the established RTL convention (ArrowLeft
            key = forward, ChevronLeft icon = next) documented in
            `use-flipbook-navigation.ts` and the original
            `flipbook-controls.tsx`. Under `dir="rtl"`, the CSS logical
            `end` maps to the physical left (and `start` to the physical
            right) — the opposite of their LTR meaning — so the "next"
            button uses `end-*` here, not `start-*`.
          */}
          <button
            type="button"
            aria-label="الصفحة التالية"
            title="الصفحة التالية"
            onClick={onNext}
            disabled={currentPageNumber >= pageCount}
            style={chromeStyle}
            onFocus={onChromeFocus}
            onBlur={onChromeBlur}
            className={`absolute end-1 top-1/2 z-10 -translate-y-1/2 sm:end-4 ${iconButtonClass}`}
          >
            <ChevronLeft className="h-7 w-7" aria-hidden="true" />
          </button>

          <div className="h-full w-full">{children}</div>

          <button
            type="button"
            aria-label="الصفحة السابقة"
            title="الصفحة السابقة"
            onClick={onPrev}
            disabled={currentPageNumber <= 1}
            style={chromeStyle}
            onFocus={onChromeFocus}
            onBlur={onChromeBlur}
            className={`absolute start-1 top-1/2 z-10 -translate-y-1/2 sm:start-4 ${iconButtonClass}`}
          >
            <ChevronRight className="h-7 w-7" aria-hidden="true" />
          </button>
        </div>

        {/* Bottom toolbar — visually secondary to the book: small, translucent, icon-first */}
        <div className="relative flex shrink-0 flex-wrap items-center justify-center gap-1 px-3 py-3 sm:gap-2" style={chromeStyle} onFocus={onChromeFocus} onBlur={onChromeBlur}>
          <button type="button" aria-label="الصفحة الأولى" title="الصفحة الأولى" onClick={onGoToStart} className={iconButtonClass}>
            <SkipForward className="h-4 w-4 rotate-180" aria-hidden="true" />
          </button>

          <button type="button" aria-label="الصفحة السابقة" title="الصفحة السابقة" onClick={onPrev} className={`sm:hidden ${iconButtonClass}`}>
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>

          <span className="min-w-[4.5rem] text-center text-sm text-white/80">
            {pageIndicatorText} / {pageCount || "—"}
          </span>

          <button type="button" aria-label="الصفحة التالية" title="الصفحة التالية" onClick={onNext} className={`sm:hidden ${iconButtonClass}`}>
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>

          <button type="button" aria-label="الصفحة الأخيرة" title="الصفحة الأخيرة" onClick={onGoToEnd} className={iconButtonClass}>
            <SkipBack className="h-4 w-4 rotate-180" aria-hidden="true" />
          </button>

          <form
            className="hidden items-center gap-1 sm:flex"
            onSubmit={(event) => {
              event.preventDefault();
              submitPageJump();
            }}
          >
            <input
              type="number"
              min={1}
              max={pageCount}
              value={pageJumpValue}
              onChange={(event) => setPageJumpValue(event.target.value)}
              placeholder="اذهب إلى صفحة"
              aria-label="الانتقال إلى صفحة"
              className="w-24 rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-sm text-white placeholder:text-white/40"
            />
          </form>

          <span className="mx-1 h-5 w-px bg-white/15" aria-hidden="true" />

          <button type="button" aria-label={soundEnabled ? "إيقاف صوت الصفحات" : "تفعيل صوت الصفحات"} title={soundEnabled ? "إيقاف صوت الصفحات" : "تفعيل صوت الصفحات"} onClick={onToggleSound} className={iconButtonClass}>
            {soundEnabled ? <Volume2 className="h-4 w-4" aria-hidden="true" /> : <VolumeX className="h-4 w-4" aria-hidden="true" />}
          </button>

          <button
            type="button"
            aria-label="المساعدة"
            title="المساعدة"
            onClick={() => setHelpOpen((value) => !value)}
            className={helpOpen ? activeIconButtonClass : iconButtonClass}
          >
            <HelpCircle className="h-4 w-4" aria-hidden="true" />
          </button>

          <button type="button" aria-label={isFullscreen ? "إنهاء وضع ملء الشاشة" : "ملء الشاشة"} title={isFullscreen ? "إنهاء وضع ملء الشاشة" : "ملء الشاشة"} onClick={toggleFullscreen} className={iconButtonClass}>
            {isFullscreen ? <Minimize className="h-4 w-4" aria-hidden="true" /> : <Maximize className="h-4 w-4" aria-hidden="true" />}
          </button>

          {pdf.downloadAllowed ? (
            canDownloadPdf ? (
              <a
                href={`/api/books/${bookSlug}/pdf`}
                download
                aria-label="تنزيل الكتاب PDF"
                title="تنزيل الكتاب PDF"
                className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/20"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">تنزيل PDF</span>
              </a>
            ) : (
              <span className="rounded-full bg-white/5 px-3 py-2 text-sm text-white/40" title="ملف PDF قيد التحضير">
                PDF قيد التحضير
              </span>
            )
          ) : null}

          {helpOpen ? (
            <div className="absolute bottom-full end-3 mb-2 w-64 rounded-lg bg-black/80 p-4 text-right text-xs text-white/90 shadow-lg backdrop-blur">
              <p className="mb-2 font-semibold text-white">اختصارات لوحة المفاتيح</p>
              <ul className="flex flex-col gap-1">
                <li>← الصفحة التالية</li>
                <li>→ الصفحة السابقة</li>
                <li>Home الصفحة الأولى</li>
                <li>End الصفحة الأخيرة</li>
                <li>Esc إغلاق الفهرس / إنهاء وضع القراءة</li>
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </Portal>
  );
}
