"use client";
import { useEffect, useRef, useState } from "react";

const IDLE_TIMEOUT_MS = 3500;

export interface UseIdleVisibilityOptions {
  /** Forces visibility on and suspends the idle timer entirely — used while the TOC panel is open, so the chrome never disappears mid-browse. */
  suspended?: boolean;
}

/**
 * Tracks whether Book Interaction mode's chrome should be visible: shown
 * on any pointer/keyboard/touch activity, hidden after `IDLE_TIMEOUT_MS`
 * of none. Two things override the timer rather than racing it:
 * `suspended` (the TOC is open) and focus actually sitting inside the
 * chrome (`onChromeFocus`/`onChromeBlur`, wired to the toolbar's own
 * `onFocus`/`onBlur`) — a keyboard user tabbing through the controls must
 * never have them fade out from under their own focus.
 *
 * This hook owns only the boolean and the activity plumbing — whether the
 * visual transition is an animated fade or an instant cut is the
 * consuming component's call, checking `prefersReducedMotion()` fresh at
 * render time per this codebase's existing convention (see
 * `flipbook.tsx`'s `onBeforeNavigate`), not baked into this hook.
 */
export function useIdleVisibility({ suspended = false }: UseIdleVisibilityOptions = {}) {
  const [isVisible, setIsVisible] = useState(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const chromeHasFocusRef = useRef(false);

  useEffect(() => {
    if (suspended) {
      setIsVisible(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      return;
    }

    function scheduleHide(): void {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        if (!chromeHasFocusRef.current) setIsVisible(false);
      }, IDLE_TIMEOUT_MS);
    }

    function onActivity(): void {
      setIsVisible(true);
      scheduleHide();
    }

    scheduleHide();
    window.addEventListener("pointermove", onActivity);
    window.addEventListener("pointerdown", onActivity);
    window.addEventListener("keydown", onActivity);
    window.addEventListener("touchstart", onActivity, { passive: true });

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      window.removeEventListener("pointermove", onActivity);
      window.removeEventListener("pointerdown", onActivity);
      window.removeEventListener("keydown", onActivity);
      window.removeEventListener("touchstart", onActivity);
    };
  }, [suspended]);

  function onChromeFocus(): void {
    chromeHasFocusRef.current = true;
    setIsVisible(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }

  function onChromeBlur(): void {
    chromeHasFocusRef.current = false;
    if (!suspended) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setIsVisible(false), IDLE_TIMEOUT_MS);
    }
  }

  return { isVisible, onChromeFocus, onChromeBlur };
}
