"use client";
import { useRef } from "react";
import { X } from "lucide-react";
import { Portal } from "@kira-joo/frontend-toolkit-tailwind/primitives";
import { useDialogA11y } from "@/lib/a11y/use-dialog-a11y";
import type { TocResultEntry } from "@/lib/books/render/page-model.interface";

export interface TocDrawerProps {
  open: boolean;
  onClose: () => void;
  toc: TocResultEntry[];
  onSelect: (pageNumber: number | null) => void;
}

/**
 * Same a11y contract as the site's other drawers/dialogs
 * (`useDialogA11y` — focus trap, `inert` background, Escape-to-close,
 * scroll lock) and the same `Portal`/`z-modal` convention as
 * `site-lightbox.tsx`, so the reader's TOC behaves identically to every
 * other overlay on the site rather than inventing its own a11y story.
 */
export function TocDrawer({ open, onClose, toc, onSelect }: TocDrawerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  useDialogA11y({ isOpen: open, onClose, containerRef });

  if (!open) return null;

  return (
    <Portal>
      <div className="fixed inset-0 z-modal flex items-center justify-center p-4" onClick={onClose}>
        <div className="absolute inset-0 bg-black/50" aria-hidden="true" />
        <div
          ref={containerRef}
          role="dialog"
          aria-modal="true"
          aria-label="فهرس المحتويات"
          dir="rtl"
          className="relative z-10 max-h-[80dvh] w-full max-w-md overflow-y-auto rounded-lg bg-white p-4 shadow-lg dark:bg-slate-800"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">المحتويات</h2>
            <button type="button" aria-label="إغلاق" onClick={onClose} className="rounded p-1 hover:bg-slate-100 dark:hover:bg-slate-700">
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          {toc.length === 0 ? (
            <p className="text-sm text-slate-500">لا توجد فصول في الفهرس.</p>
          ) : (
            <ul className="flex flex-col gap-1">
              {toc.map((entry) => (
                <li key={entry.chapterId}>
                  <button
                    type="button"
                    onClick={() => onSelect(entry.pageNumber)}
                    disabled={entry.pageNumber === null}
                    className="flex w-full items-center justify-between rounded px-2 py-2 text-right text-sm hover:bg-slate-100 disabled:opacity-40 dark:hover:bg-slate-700"
                  >
                    <span>{entry.title}</span>
                    {entry.pageNumber !== null ? <span className="text-slate-400">{entry.pageNumber}</span> : null}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Portal>
  );
}
