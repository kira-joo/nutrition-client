"use client";
import { useEffect, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { Portal } from "@kira-joo/frontend-toolkit-tailwind/primitives";
import { cn } from "@/lib/cn";
import { useDialogA11y } from "@/lib/a11y/use-dialog-a11y";
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
 * Reuses `useDialogA11y` (Escape, focus trap, focus restoration, background
 * inert, scroll lock) and `useDrawerTransition` (GSAP, reduced-motion
 * gated) rather than growing a second, subtly different dialog on the site.
 * The panel stays mounted so the close transition can run, which is exactly
 * why `useDialogA11y` also marks it inert while closed.
 *
 * Portalled to the body because this sheet renders inside `<main>`, which
 * `useDialogA11y` marks inert while a dialog is open — in place, the sheet
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
  // Portal renders nothing until mounted, so the panel doesn't exist on the
  // first pass; the transition has to wait for it (see `ready`).
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  const { panelRef, backdropRef } = useDrawerTransition({ isOpen, fromEdge: "end", ready: isMounted });
  useDialogA11y({ isOpen, onClose: () => setIsOpen(false), containerRef: panelRef });

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

        {/* No CSS transform here: GSAP owns this element's transform exclusively (see useDrawerTransition). */}
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
