"use client";
import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { Portal } from "@kira-joo/frontend-toolkit-tailwind/primitives";
import { cn } from "@/lib/cn";
import { useDialogLayer } from "@kira-joo/frontend-toolkit-tailwind/dialog";
import { useDrawerTransition } from "@/lib/animation/use-drawer-transition";
import { RecipeFilterPanel, type RecipeFilterPanelProps } from "@/components/recipes/recipe-filter-panel";

export interface RecipeFilterSheetProps extends Omit<RecipeFilterPanelProps, "onNavigate"> {
  activeCount: number;
  openLabel: string;
  closeLabel: string;
  title: string;
}

/**
 * The mobile filter surface: a bottom sheet, not the desktop sidebar
 * shrunk. Filters are a deliberate detour on a phone — you open them,
 * choose, and get back to results — so they belong behind a trigger that
 * shows how many are active, rather than occupying the top of every scroll.
 *
 * Shares the toolkit's dialog layer coordinator (Escape, focus trap, focus
 * restoration, background inert, scroll lock) and `useDrawerTransition`
 * (Motion, reduced-motion gated) rather than growing a second, subtly
 * different dialog on the site. The panel stays mounted so the close
 * transition can run, which is exactly why the layer is registered with
 * `inertWhenClosed`.
 *
 * Portalled to the body because this sheet renders inside `<main>`, which the
 * coordinator marks inert while a dialog is open — in place, the sheet
 * inerted its own subtree and focus never entered it (measured: it opened
 * visibly with `document.activeElement` still on `<body>`). The site header
 * drawer never hit this only because it happens to live in `<header>`.
 */
export function RecipeFilterSheet({
  activeCount,
  openLabel,
  closeLabel,
  title,
  ...panelProps
}: RecipeFilterSheetProps) {
  const [isOpen, setIsOpen] = useState(false);

  /**
   * Escape, focus containment/restore, background inert and the scroll lock
   * come from the shared coordinator; this sheet keeps only its own open state
   * (it closes on each navigation) and its slide transition. One owner of the
   * panel node means no ref merging, and the old `ready`-flag gap — where a
   * portalled surface silently skipped focus/inert/Escape/scroll-lock on its
   * first open — is now unrepresentable rather than guarded against.
   */
  const { panelRef, panel } = useDialogLayer({
    isOpen,
    onEscape: () => setIsOpen(false),
    inertWhenClosed: true,
  });
  const { backdropRef } = useDrawerTransition({ isOpen, panel, fromEdge: "end" });

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex h-control-md items-center gap-2 rounded-full border-hairline border-border bg-surface px-4 text-body-sm font-semibold text-text-primary lg:hidden"
      >
        <SlidersHorizontal className="size-icon-sm" aria-hidden="true" />
        {openLabel}
        {activeCount > 0 && (
          <span className="flex size-icon-md items-center justify-center rounded-full bg-primary text-caption font-bold text-white">
            {activeCount}
          </span>
        )}
      </button>

      <Portal>
        <div
          ref={backdropRef}
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
          className={cn("fixed inset-0 z-drawer bg-overlay lg:hidden", !isOpen && "invisible opacity-0")}
        />

        {/* No CSS transform here: useDrawerTransition owns this element's transform exclusively. */}
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label={title}
          className="fixed inset-y-0 end-0 z-drawer flex w-[min(22rem,90vw)] flex-col bg-surface shadow-lg lg:hidden"
        >
          <div className="flex items-center justify-between border-b-hairline border-border p-4">
            <h2 className="text-heading-3 font-bold text-text-primary">{title}</h2>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label={closeLabel}
              className="flex size-touch-min items-center justify-center text-text-primary"
            >
              <X className="size-icon-lg" aria-hidden="true" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {/* Closing on selection: each change is a navigation, and leaving the sheet covering the results the visitor just asked for would hide the outcome. */}
            <RecipeFilterPanel {...panelProps} onNavigate={() => setIsOpen(false)} />
          </div>
        </div>
      </Portal>
    </>
  );
}
