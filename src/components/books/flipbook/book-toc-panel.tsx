"use client";
import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { Portal } from "@kira-joo/frontend-toolkit-tailwind/primitives";
import { useDialogA11y } from "@/lib/a11y/use-dialog-a11y";
import type { TocResultEntry } from "@/lib/books/render/page-model.interface";

export interface BookTocPanelProps {
  open: boolean;
  onClose: () => void;
  toc: TocResultEntry[];
  /** Called with the target chapter's `sequencePosition` (physical position), never its printed `pageNumber` — see `TocResultEntry`'s own doc comment for why the two diverge. */
  onSelect: (sequencePosition: number | null) => void;
  /**
   * True when opened from inside Book Interaction mode, which is already
   * its own modal dialog (`book-immersive-chrome.tsx`). A nested panel
   * skips its own `useDialogA11y` entirely rather than running a second,
   * independent focus trap/Escape handler/background-inert alongside the
   * immersive chrome's — two dialogs each fighting to own Tab/Escape is
   * exactly the kind of bug that only shows up interactively. The
   * immersive chrome's own Escape handler already closes the TOC first
   * (`tocOpen ? setTocOpen(false) : exitImmersive()`), and its focus trap
   * already spans this panel since both live under the same dialog
   * surface. In page mode (not nested), this is the only dialog open, so
   * it manages its own a11y exactly like the panel it replaced.
   */
  isNested?: boolean;
}

/**
 * Renamed from `toc-drawer.tsx` (same component, adapted): an inset side
 * panel per the approved visual reference rather than a full-width sheet.
 * Reuses `Portal`/`z-modal` — the same convention as every other overlay
 * in this app — and Portal's own append-order means a panel opened while
 * Book Interaction mode is already showing lands after it in `document.body`
 * and stacks on top at the same `z-modal` level with no extra z-index
 * needed.
 */
export function BookTocPanel({ open, onClose, toc, onSelect, isNested = false }: BookTocPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // `Portal` defers to `document.body` via its own effect, so on the
  // render where `open` first becomes true, `containerRef.current` is
  // still null — `useDialogA11y`'s effects would see that, bail out, and
  // never run again (neither `isOpen` nor the ref object identity changes
  // once the container actually mounts). Same gap `mobile-nav-drawer.tsx`
  // documents and fixes the same way.
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);
  useDialogA11y({ isOpen: open && !isNested, onClose, containerRef, ready: isMounted });

  if (!open) return null;

  return (
    // ALWAYS a right-anchored side drawer, at any viewport width — never a
    // centered modal on wider screens. A TOC is a persistent navigation
    // aid meant to sit alongside the open spread, not interrupt it the
    // way a centered dialog would.
    <Portal>
      <div className="fixed inset-0 z-modal flex items-stretch justify-end" onClick={onClose}>
        {!isNested && <div className="absolute inset-0 bg-black/50" aria-hidden="true" />}
        <div
          ref={containerRef}
          role={isNested ? undefined : "dialog"}
          aria-modal={isNested ? undefined : true}
          aria-label="فهرس المحتويات"
          dir="rtl"
          className="relative z-10 h-full w-full max-w-xs overflow-y-auto bg-white shadow-lg dark:bg-slate-800 sm:max-w-sm"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-center justify-between p-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">فهرس الكتاب</h2>
            <button type="button" aria-label="إغلاق" onClick={onClose} className="rounded p-1 hover:bg-slate-100 dark:hover:bg-slate-700">
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          {toc.length === 0 ? (
            <p className="p-4 text-sm text-slate-500">لا توجد فصول في الفهرس.</p>
          ) : (
            <ul className="flex flex-col gap-1 px-2 pb-4">
              {toc.map((entry) => (
                <li key={entry.chapterId}>
                  <button
                    type="button"
                    onClick={() => onSelect(entry.sequencePosition)}
                    disabled={entry.sequencePosition === null}
                    className="flex w-full flex-col items-start gap-0.5 rounded px-3 py-2.5 text-right hover:bg-slate-100 disabled:opacity-40 dark:hover:bg-slate-700"
                  >
                    <div className="flex w-full items-center justify-between gap-2">
                      <span className="text-caption font-semibold uppercase tracking-wide text-slate-400">{entry.label}</span>
                      {entry.pageNumber !== null ? <span className="text-caption text-slate-400">{entry.pageNumber}</span> : null}
                    </div>
                    <span className="text-sm text-slate-900 dark:text-white">{entry.title}</span>
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
