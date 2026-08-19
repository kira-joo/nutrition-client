"use client";
import { useRef } from "react";
import { animate } from "motion";
import { useReducedMotion } from "motion/react";
import { DURATIONS, MOTION_EASES } from "./motion-tokens";
import { useIsomorphicLayoutEffect } from "./use-isomorphic-layout-effect";

export interface UseDrawerTransitionOptions {
  isOpen: boolean;
  /**
   * Which logical edge the drawer is docked to — mirrors automatically
   * under `dir="rtl"`. A percentage `x` transform animates in the physical
   * (left/right) coordinate space regardless of document direction, so the
   * offscreen sign is resolved from `document.documentElement.dir` at
   * animation time rather than hardcoded — the drawer itself should still
   * be positioned with a logical Tailwind utility (`end-0`/`start-0`) so
   * both agree on which physical side "end" resolves to.
   */
  fromEdge?: "start" | "end";
  /**
   * Set false while the panel isn't in the DOM yet. A portalled drawer
   * renders nothing until its host has mounted, so this hook's layout
   * effect would otherwise run once against a null ref, never set the
   * closed position, and leave the panel sitting on screen swallowing
   * clicks. Flipping this after mount re-runs the effect with the element
   * actually present.
   */
  ready?: boolean;
}

/**
 * Drives a drawer panel's slide-in/out and its backdrop's fade via Motion's
 * imperative `animate()`, applied straight to the ref'd DOM nodes — the
 * same "own the transform exclusively" contract the GSAP version had (see
 * the site-header/mobile-nav-drawer doc comments): no CSS-authored
 * transform on the panel, or the very first animated frame would layer a
 * translate on top of one instead of replacing it.
 */
export function useDrawerTransition({ isOpen, fromEdge = "end", ready = true }: UseDrawerTransitionOptions) {
  const panelRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const isFirstRun = useRef(true);
  const prefersReducedMotion = useReducedMotion();

  useIsomorphicLayoutEffect(() => {
    if (!ready) return;
    const panel = panelRef.current;
    const backdrop = backdropRef.current;
    if (!panel) return;

    const isRtl = document.documentElement.dir === "rtl";
    const edgeSign = fromEdge === "end" ? (isRtl ? -1 : 1) : isRtl ? 1 : -1;
    const offscreenX = `${100 * edgeSign}%`;

    if (prefersReducedMotion) {
      animate(panel, { x: isOpen ? "0%" : offscreenX }, { duration: 0 });
      if (backdrop) animate(backdrop, { opacity: isOpen ? 1 : 0 }, { duration: 0 });
      isFirstRun.current = false;
      return;
    }

    if (isFirstRun.current) {
      animate(panel, { x: isOpen ? "0%" : offscreenX }, { duration: 0 });
      if (backdrop) animate(backdrop, { opacity: isOpen ? 1 : 0 }, { duration: 0 });
      isFirstRun.current = false;
      return;
    }

    animate(
      panel,
      { x: isOpen ? "0%" : offscreenX },
      { duration: DURATIONS.base, ease: isOpen ? MOTION_EASES.emphasized : MOTION_EASES.standard },
    );
    if (backdrop) {
      animate(backdrop, { opacity: isOpen ? 1 : 0 }, { duration: DURATIONS.base, ease: MOTION_EASES.standard });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, fromEdge, ready, prefersReducedMotion]);

  return { panelRef, backdropRef };
}
