"use client";
import { useState } from "react";
import { ChevronLeft, ChevronRight, List, Maximize, Minimize, Volume2, VolumeX, ZoomIn, ZoomOut, Download, SkipBack, SkipForward } from "lucide-react";
import type { BookPdfAvailability } from "@/lib/domain/book";

const ZOOM_STEP = 0.25;
const ZOOM_MIN = 1;
const ZOOM_MAX = 2.5;

export interface FlipbookControlsProps {
  currentPageNumber: number;
  pageCount: number;
  onNext: () => void;
  onPrev: () => void;
  onGoToPage: (pageNumber: number) => void;
  onGoToStart: () => void;
  onGoToEnd: () => void;
  onOpenToc: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  pdf: BookPdfAvailability;
  bookSlug: string;
}

/**
 * `ArrowLeft`/`ArrowRight` icons here are deliberately NOT mirrored —
 * unlike `useIsRtl()`-driven chrome elsewhere in this app (see
 * `site-lightbox.tsx`), these buttons' physical direction always means
 * "forward"/"backward" in the book's own reading direction, which is
 * itself already mirrored relative to an LTR carousel (see
 * `use-flipbook-navigation.ts`). The button on the reader's right
 * physically points left ("deeper into the book"); labelling it
 * differently would fight the icon it's using.
 */
export function FlipbookControls({
  currentPageNumber,
  pageCount,
  onNext,
  onPrev,
  onGoToPage,
  onGoToStart,
  onGoToEnd,
  onOpenToc,
  isFullscreen,
  onToggleFullscreen,
  zoom,
  onZoomChange,
  soundEnabled,
  onToggleSound,
  pdf,
  bookSlug,
}: FlipbookControlsProps) {
  const [pageJumpValue, setPageJumpValue] = useState("");

  function submitPageJump(): void {
    const parsed = Number(pageJumpValue);
    if (Number.isFinite(parsed) && parsed >= 1 && parsed <= pageCount) {
      onGoToPage(parsed);
    }
    setPageJumpValue("");
  }

  const canDownloadPdf = pdf.downloadAllowed && pdf.ready;

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 rounded-md bg-white/90 p-2 shadow-sm dark:bg-slate-800/90" dir="rtl">
      <button type="button" aria-label="الصفحة الأولى" title="الصفحة الأولى" onClick={onGoToStart} className="rounded p-2 hover:bg-slate-100 dark:hover:bg-slate-700">
        <SkipForward className="h-4 w-4 rotate-180" aria-hidden="true" />
      </button>
      <button type="button" aria-label="الصفحة السابقة" title="الصفحة السابقة" onClick={onPrev} className="rounded p-2 hover:bg-slate-100 dark:hover:bg-slate-700">
        <ChevronRight className="h-5 w-5" aria-hidden="true" />
      </button>

      <span className="min-w-[5rem] text-center text-sm text-slate-600 dark:text-slate-300">
        {currentPageNumber} / {pageCount || "—"}
      </span>

      <button type="button" aria-label="الصفحة التالية" title="الصفحة التالية" onClick={onNext} className="rounded p-2 hover:bg-slate-100 dark:hover:bg-slate-700">
        <ChevronLeft className="h-5 w-5" aria-hidden="true" />
      </button>
      <button type="button" aria-label="الصفحة الأخيرة" title="الصفحة الأخيرة" onClick={onGoToEnd} className="rounded p-2 hover:bg-slate-100 dark:hover:bg-slate-700">
        <SkipBack className="h-4 w-4 rotate-180" aria-hidden="true" />
      </button>

      <form
        className="flex items-center gap-1"
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
          className="w-24 rounded border border-slate-300 px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-900"
        />
      </form>

      <span className="mx-1 h-6 w-px bg-slate-200 dark:bg-slate-700" aria-hidden="true" />

      <button type="button" aria-label="فهرس المحتويات" title="فهرس المحتويات" onClick={onOpenToc} className="rounded p-2 hover:bg-slate-100 dark:hover:bg-slate-700">
        <List className="h-5 w-5" aria-hidden="true" />
      </button>

      <button type="button" aria-label="تصغير" title="تصغير" onClick={() => onZoomChange(Math.max(ZOOM_MIN, zoom - ZOOM_STEP))} disabled={zoom <= ZOOM_MIN} className="rounded p-2 hover:bg-slate-100 disabled:opacity-40 dark:hover:bg-slate-700">
        <ZoomOut className="h-5 w-5" aria-hidden="true" />
      </button>
      <button type="button" aria-label="تكبير" title="تكبير" onClick={() => onZoomChange(Math.min(ZOOM_MAX, zoom + ZOOM_STEP))} disabled={zoom >= ZOOM_MAX} className="rounded p-2 hover:bg-slate-100 disabled:opacity-40 dark:hover:bg-slate-700">
        <ZoomIn className="h-5 w-5" aria-hidden="true" />
      </button>

      <button type="button" aria-label={isFullscreen ? "إنهاء وضع ملء الشاشة" : "ملء الشاشة"} title={isFullscreen ? "إنهاء وضع ملء الشاشة" : "ملء الشاشة"} onClick={onToggleFullscreen} className="rounded p-2 hover:bg-slate-100 dark:hover:bg-slate-700">
        {isFullscreen ? <Minimize className="h-5 w-5" aria-hidden="true" /> : <Maximize className="h-5 w-5" aria-hidden="true" />}
      </button>

      <button type="button" aria-label={soundEnabled ? "إيقاف صوت الصفحات" : "تفعيل صوت الصفحات"} title={soundEnabled ? "إيقاف صوت الصفحات" : "تفعيل صوت الصفحات"} onClick={onToggleSound} className="rounded p-2 hover:bg-slate-100 dark:hover:bg-slate-700">
        {soundEnabled ? <Volume2 className="h-5 w-5" aria-hidden="true" /> : <VolumeX className="h-5 w-5" aria-hidden="true" />}
      </button>

      {pdf.downloadAllowed ? (
        canDownloadPdf ? (
          <a
            href={`/api/books/${bookSlug}/pdf`}
            download
            aria-label="تنزيل الكتاب PDF"
            title="تنزيل الكتاب PDF"
            className="flex items-center gap-1 rounded bg-emerald-700 px-3 py-2 text-sm text-white hover:bg-emerald-800"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            تنزيل PDF
          </a>
        ) : (
          <span className="rounded bg-slate-100 px-3 py-2 text-sm text-slate-400 dark:bg-slate-700" title="ملف PDF قيد التحضير">
            PDF قيد التحضير
          </span>
        )
      ) : null}
    </div>
  );
}
