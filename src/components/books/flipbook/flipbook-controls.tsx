"use client";
import { useState } from "react";
import { BookOpen, ChevronLeft, ChevronRight, Download, List } from "lucide-react";
import type { BookPdfAvailability } from "@/lib/domain/book";

export interface FlipbookControlsProps {
  currentPageNumber: number;
  pageCount: number;
  onNext: () => void;
  onPrev: () => void;
  onGoToPage: (pageNumber: number) => void;
  onOpenToc: () => void;
  pdf: BookPdfAvailability;
  bookSlug: string;
  onEnterImmersive: () => void;
}

/**
 * The restrained normal-page-mode bar: prev/next, page indicator, TOC,
 * and PDF — first/last, direct page jump, zoom, fullscreen, and sound all
 * moved to `book-immersive-chrome.tsx`'s fuller toolbar. Page mode is
 * meant to read as a lightweight preview with the site's own chrome still
 * around it; the prominent "Book Interaction" button is the one clearly
 * obvious way into the real reading experience, not a peer of the other
 * controls.
 */
export function FlipbookControls({ currentPageNumber, pageCount, onNext, onPrev, onGoToPage, onOpenToc, pdf, bookSlug, onEnterImmersive }: FlipbookControlsProps) {
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
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-md bg-white/90 p-2 shadow-sm dark:bg-slate-800/90" dir="rtl">
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" aria-label="الصفحة السابقة" title="الصفحة السابقة" onClick={onPrev} className="rounded p-2 hover:bg-slate-100 dark:hover:bg-slate-700">
          <ChevronRight className="h-5 w-5" aria-hidden="true" />
        </button>

        <span className="min-w-[5rem] text-center text-sm text-slate-600 dark:text-slate-300">
          {currentPageNumber} / {pageCount || "—"}
        </span>

        <button type="button" aria-label="الصفحة التالية" title="الصفحة التالية" onClick={onNext} className="rounded p-2 hover:bg-slate-100 dark:hover:bg-slate-700">
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
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
            className="w-24 rounded border border-slate-300 px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-900"
          />
        </form>

        <button type="button" aria-label="فهرس المحتويات" title="فهرس المحتويات" onClick={onOpenToc} className="rounded p-2 hover:bg-slate-100 dark:hover:bg-slate-700">
          <List className="h-5 w-5" aria-hidden="true" />
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

      <button
        type="button"
        onClick={onEnterImmersive}
        className="flex items-center gap-2 rounded-full bg-[#0f3a32] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0c2e28]"
      >
        <BookOpen className="h-4 w-4" aria-hidden="true" />
        وضع القراءة التفاعلية
      </button>
    </div>
  );
}
