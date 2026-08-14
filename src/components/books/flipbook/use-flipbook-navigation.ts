"use client";
import { useCallback, useEffect, useRef, useState } from "react";

export interface UseFlipbookNavigationOptions {
  pageCount: number;
  /** 2 on desktop (a "next" advances a whole spread), 1 on mobile (single page at a time). Read fresh on every navigation call, not baked into the hook's own state. */
  getStepSize: () => number;
  /** Called with the direction just before the page number actually changes, so the caller can trigger the page-turn animation before the new content swaps in. */
  onBeforeNavigate?: (direction: "forward" | "backward") => void;
}

const SWIPE_THRESHOLD_PX = 50;

/**
 * Owns the single source of navigation truth — `currentPageNumber` — and
 * every input method that changes it (keyboard, swipe, programmatic
 * jumps) funnels through the same `goNext`/`goPrev`/`goToPage`.
 *
 * RTL-mirrored by design, per the approved physical model
 * (`book-physical-order.ts`): "forward" (deeper into the book, higher
 * page numbers) is triggered by ArrowLeft and a right-to-left swipe —
 * the mirror image of an LTR carousel's ArrowRight/leftward-swipe.
 */
export function useFlipbookNavigation({ pageCount, getStepSize, onBeforeNavigate }: UseFlipbookNavigationOptions) {
  const [currentPageNumber, setCurrentPageNumber] = useState(1);
  const touchStartX = useRef<number | null>(null);

  const goNext = useCallback(() => {
    setCurrentPageNumber((current) => {
      const target = Math.min(pageCount, current + getStepSize());
      if (target === current) return current;
      onBeforeNavigate?.("forward");
      return target;
    });
  }, [pageCount, getStepSize, onBeforeNavigate]);

  const goPrev = useCallback(() => {
    setCurrentPageNumber((current) => {
      const target = Math.max(1, current - getStepSize());
      if (target === current) return current;
      onBeforeNavigate?.("backward");
      return target;
    });
  }, [getStepSize, onBeforeNavigate]);

  const goToPage = useCallback(
    (pageNumber: number) => {
      const target = Math.min(pageCount, Math.max(1, Math.round(pageNumber)));
      setCurrentPageNumber((current) => {
        if (target === current) return current;
        onBeforeNavigate?.(target > current ? "forward" : "backward");
        return target;
      });
    },
    [pageCount, onBeforeNavigate]
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
