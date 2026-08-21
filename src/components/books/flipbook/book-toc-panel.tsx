"use client";

import { X } from "lucide-react";
import { Portal } from "@kira-joo/frontend-toolkit-tailwind/primitives";
import { useDialogLayer } from "@kira-joo/frontend-toolkit-tailwind/dialog";
import type { TocResultEntry } from "@/lib/books/render/page-model.interface";

export interface BookTocPanelProps {
  open: boolean;
  onClose: () => void;
  toc: TocResultEntry[];
  /** Called with the target chapter's `sequencePosition` (physical position), never its printed `pageNumber` — see `TocResultEntry`'s own doc comment for why the two diverge. */
  onSelect: (sequencePosition: number | null) => void;
  /**
   * PRESENTATION ONLY, and deliberately no longer an accessibility switch.
   * When opened from inside Book Interaction mode the panel sits over the
   * reader's own dark field, so a second scrim would double-dim it — that is
   * the whole remaining job of this flag. It used to also disable this
   * panel's focus trap and Escape handling to stop two independent
   * implementations fighting; the shared coordinator makes that unnecessary,
   * because nesting is now just stacking.
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
  /**
   * Registers as its own layer, even when opened from inside Book Interaction
   * mode. That replaces the old `isNested` opt-out, which existed because two
   * surfaces each ran an independent focus trap and Escape handler and fought
   * over Tab. With one coordinator the nesting is just stacking: this panel is
   * top-most, so Escape closes it first and the immersive chrome underneath
   * keeps its own layer for the second press — the same one-layer-at-a-time
   * unwind, now emergent instead of hand-coded in two places.
   */
  const { panelRef } = useDialogLayer({ isOpen: open, onEscape: onClose });

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
          ref={panelRef}
          role="dialog"
          aria-modal
          aria-label="فهرس المحتويات"
          dir="rtl"
          className="relative z-10 h-full w-full max-w-xs overflow-y-auto bg-white shadow-lg dark:bg-slate-800 sm:max-w-sm"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-center justify-between p-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">فهرس الكتاب</h2>
            <button type="button" aria-label="إغلاق" onClick={onClose} className="rounded p-1 pointer:hover:bg-slate-100 dark:pointer:hover:bg-slate-700">
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
                    className="flex w-full flex-col items-start gap-0.5 rounded px-3 py-2.5 text-right pointer:hover:bg-slate-100 disabled:opacity-40 dark:pointer:hover:bg-slate-700"
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
