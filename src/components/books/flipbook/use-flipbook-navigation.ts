"use client";
import { useCallback, useEffect, useRef, useState } from "react";

export interface UseFlipbookNavigationOptions {
  pageCount: number;
  /** 2 on desktop (a "next" advances a whole spread), 1 on mobile (single page at a time). Read fresh on every navigation call, not baked into the hook's own state. */
  getStepSize: () => number;
  /**
   * Called BEFORE `currentPageNumber` changes — the hook's own state does
   * NOT update until the caller invokes the supplied `commit` callback.
   * This is what lets the caller show a real page-turn animation with the
   * OLD spread still on screen and only swap to the new one once the
   * animation finishes, instead of the state (and therefore the visible
   * content) changing immediately while an unrelated overlay animates on
   * top of it — the latter is what reads as "a PDF viewer switching
   * pages", not a book turning.
   *
   * If reduced motion (or any other caller) wants an instant transition,
   * call `commit()` synchronously inside this callback.
   */
  onBeforeNavigate?: (direction: "forward" | "backward", targetPageNumber: number, commit: () => void) => void;
}

const SWIPE_THRESHOLD_PX = 50;

/**
 * Owns the single source of navigation truth — `currentPageNumber` — and
 * every input method that changes it (keyboard, swipe, programmatic
 * jumps) funnels through the same `goNext`/`goPrev`/`goToPage`. A
 * navigation already in flight (its `commit` not yet called) blocks
 * further input, matching a real book: you can't start a second page
 * turn while the first is still mid-air.
 *
 * RTL-mirrored by design, per the approved physical model
 * (`book-physical-order.ts`): "forward" (deeper into the book, higher
 * page numbers) is triggered by ArrowLeft and a right-to-left swipe —
 * the mirror image of an LTR carousel's ArrowRight/leftward-swipe.
 */
export function useFlipbookNavigation({ pageCount, getStepSize, onBeforeNavigate }: UseFlipbookNavigationOptions) {
  const [currentPageNumber, setCurrentPageNumber] = useState(1);
  const touchStartX = useRef<number | null>(null);
  const isNavigatingRef = useRef(false);

  const navigateTo = useCallback(
    (target: number, direction: "forward" | "backward") => {
      if (target === currentPageNumber || isNavigatingRef.current) return;
      if (!onBeforeNavigate) {
        setCurrentPageNumber(target);
        return;
      }
      isNavigatingRef.current = true;
      onBeforeNavigate(direction, target, () => {
        isNavigatingRef.current = false;
        setCurrentPageNumber(target);
      });
    },
    [currentPageNumber, onBeforeNavigate]
  );

  const goNext = useCallback(() => {
    const target = Math.min(pageCount, currentPageNumber + getStepSize());
    navigateTo(target, "forward");
  }, [pageCount, currentPageNumber, getStepSize, navigateTo]);

  const goPrev = useCallback(() => {
    const target = Math.max(1, currentPageNumber - getStepSize());
    navigateTo(target, "backward");
  }, [currentPageNumber, getStepSize, navigateTo]);

  const goToPage = useCallback(
    (pageNumber: number) => {
      const target = Math.min(pageCount, Math.max(1, Math.round(pageNumber)));
      navigateTo(target, target > currentPageNumber ? "forward" : "backward");
    },
    [pageCount, currentPageNumber, navigateTo]
  );

  const goToStart = useCallback(() => goToPage(1), [goToPage]);
  const goToEnd = useCallback(() => goToPage(pageCount), [goToPage, pageCount]);

  useEffect(() => {
    function isTypingTarget(target: EventTarget | null): boolean {
      if (!(target instanceof HTMLElement)) return false;
      return target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;
    }

    function onKeyDown(event: KeyboardEvent): void {
      if (isTypingTarget(event.target)) return;
      switch (event.key) {
        case "ArrowLeft":
          event.preventDefault();
          goNext();
          break;
        case "ArrowRight":
          event.preventDefault();
          goPrev();
          break;
        case "Home":
          event.preventDefault();
          goToStart();
          break;
        case "End":
          event.preventDefault();
          goToEnd();
          break;
        default:
          break;
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goNext, goPrev, goToStart, goToEnd]);

  const onTouchStart = useCallback((event: React.TouchEvent) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  }, []);

  const onTouchEnd = useCallback(
    (event: React.TouchEvent) => {
      const startX = touchStartX.current;
      touchStartX.current = null;
      if (startX === null) return;
      const endX = event.changedTouches[0]?.clientX;
      if (endX === undefined) return;
      const deltaX = endX - startX;
      if (deltaX <= -SWIPE_THRESHOLD_PX) goNext();
      else if (deltaX >= SWIPE_THRESHOLD_PX) goPrev();
    },
    [goNext, goPrev]
  );

  return { currentPageNumber, goNext, goPrev, goToPage, goToStart, goToEnd, onTouchStart, onTouchEnd };
}
