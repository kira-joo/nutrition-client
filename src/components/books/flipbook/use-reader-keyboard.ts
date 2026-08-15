"use client";
import { useEffect } from "react";

export interface ReaderKeyboardActions {
  onNext: () => void;
  onPrev: () => void;
  onGoToStart: () => void;
  onGoToEnd: () => void;
}

/**
 * Keyboard navigation only. Pointer input — drag, swipe, click-to-turn,
 * corner peel — belongs entirely to the flip engine, which manipulates
 * the page directly rather than translating a gesture into a canned
 * animation after the fact.
 *
 * RTL-mirrored by design, per the physical model in
 * `book-physical-order.ts`: "forward" (deeper into the book, higher page
 * numbers) is ArrowLeft, the mirror image of an LTR carousel's
 * ArrowRight.
 */
export function useReaderKeyboard({ onNext, onPrev, onGoToStart, onGoToEnd }: ReaderKeyboardActions): void {
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
          onNext();
          break;
        case "ArrowRight":
          event.preventDefault();
          onPrev();
          break;
        case "Home":
          event.preventDefault();
          onGoToStart();
          break;
        case "End":
          event.preventDefault();
          onGoToEnd();
          break;
        default:
          break;
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onNext, onPrev, onGoToStart, onGoToEnd]);
}
