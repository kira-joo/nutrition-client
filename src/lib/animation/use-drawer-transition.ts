"use client";
import { useLayoutEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "./gsap-config";
import { DURATIONS, EASES } from "./motion-tokens";

export interface UseDrawerTransitionOptions {
  isOpen: boolean;
  /**
   * Which logical edge the drawer is docked to — mirrors automatically
   * under `dir="rtl"`. GSAP's `xPercent` animates in the physical
   * (left/right) coordinate space regardless of document direction, so
   * the offscreen sign is resolved from `document.documentElement.dir` at
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
 * Drives a drawer panel's slide-in/out and its backdrop's fade, replacing
 * a CSS-transition approach with GSAP per the project's animation
 * convention (every interactive-component transition goes through GSAP,
 * not framer-motion or a bare CSS transition, so `prefers-reduced-motion`
 * handling stays centralized in one place — see `gsap-config.ts`).
 */
export function useDrawerTransition({ isOpen, fromEdge = "end", ready = true }: UseDrawerTransitionOptions) {
  const panelRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const isFirstRun = useRef(true);

  useLayoutEffect(() => {
    if (!ready) return;
    const panel = panelRef.current;
    const backdrop = backdropRef.current;
    if (!panel) return;

    const isRtl = document.documentElement.dir === "rtl";
    const edgeSign = fromEdge === "end" ? (isRtl ? -1 : 1) : isRtl ? 1 : -1;
    const offscreenXPercent = 100 * edgeSign;

    // The panel has no CSS-authored transform (see site-header.tsx's doc
    // comment on the dialog className) — GSAP is the only thing that ever
    // writes its transform, so its very first touch must be an instant
    // `set`, not an animated `to`. Mixing a pre-existing CSS transform with
    // GSAP's xPercent tween is what caused the original bug this guards
    // against: GSAP doesn't decompose/replace a transform it didn't write
    // itself, it layers its own translate() on top of it, doubling the
    // offset. Running this synchronously in useLayoutEffect (before paint)
    // is what avoids a flash of the open drawer on mount, in place of the
    // CSS default this used to lean on.
    if (prefersReducedMotion()) {
      gsap.set(panel, { xPercent: isOpen ? 0 : offscreenXPercent });
      if (backdrop) gsap.set(backdrop, { autoAlpha: isOpen ? 1 : 0 });
      isFirstRun.current = false;
      return;
    }

    if (isFirstRun.current) {
      gsap.set(panel, { xPercent: isOpen ? 0 : offscreenXPercent });
      if (backdrop) gsap.set(backdrop, { autoAlpha: isOpen ? 1 : 0 });
      isFirstRun.current = false;
      return;
    }

    const ctx = gsap.context(() => {
      gsap.to(panel, {
        xPercent: isOpen ? 0 : offscreenXPercent,
        duration: DURATIONS.base,
        ease: isOpen ? EASES.emphasized : EASES.standard,
      });
      if (backdrop) {
        gsap.to(backdrop, { autoAlpha: isOpen ? 1 : 0, duration: DURATIONS.base, ease: EASES.standard });
      }
    });

    return () => ctx.revert();
  }, [isOpen, fromEdge, ready]);

  return { panelRef, backdropRef };
}
