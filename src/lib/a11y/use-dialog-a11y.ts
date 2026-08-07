"use client";
import { useEffect, useRef, type RefObject } from "react";

/**
 * Matches what the browser itself treats as sequentially focusable.
 * `[tabindex="-1"]` is deliberately excluded: it's programmatically
 * focusable but must not be a Tab stop, which is exactly the distinction
 * a focus trap cares about.
 */
const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

/**
 * Elements the drawer/dialog should suppress while open. `<main>` and
 * `<footer>` are the whole page behind the panel; the header's own bar is
 * left alone because the panel itself lives inside `<header>` (marking an
 * ancestor inert would suppress the panel too).
 */
const BACKGROUND_SELECTOR = "main, footer";

export interface UseDialogA11yOptions {
  isOpen: boolean;
  /** Called on Escape. Kept in a ref internally, so an inline arrow at the call site won't re-run the effect. */
  onClose: () => void;
  /** The dialog surface itself — focus is confined within this element. */
  containerRef: RefObject<HTMLElement | null>;
}

/**
 * The keyboard/screen-reader half of a modal surface, deliberately split
 * from `useDrawerTransition` (which owns only the visual transition):
 * these two concerns have no shared state and change for entirely
 * different reasons, and a11y behavior must not depend on whether an
 * animation is running or on `prefers-reduced-motion`.
 *
 * Covers, per WCAG 2.2 AA and the approved plan's §19 requirements:
 * Escape-to-close, focus moved into the surface on open, focus confined
 * while open (both Tab and Shift+Tab, plus a guard that pulls focus back
 * if it escapes by any other route), focus restored to the element that
 * opened it on close, background content suppressed for keyboard and
 * assistive tech, and body scroll locked without a layout shift.
 *
 * DEFERRED TOOLKIT EXTRACTION (decided, not an open question): this stays
 * app-local until there are multiple independent consumers. The eventual
 * home is `frontend-toolkit-tailwind`, whose `AssetLightbox` documents this
 * exact focus-restoration gap in its own doc comment and whose `Modal` and
 * `ConfirmDialog` would benefit identically — but one consumer is not
 * enough signal to fix the API shape in a published package, and extracting
 * early would freeze it around this drawer's needs. Revisit once the
 * Drawer, AssetLightbox, Modal, and ConfirmDialog cases can all be weighed
 * together; until then, prefer duplicating a few lines over a premature
 * abstraction (plan §23, §24).
 */
export function useDialogA11y({ isOpen, onClose, containerRef }: UseDialogA11yOptions) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  /**
   * The panel stays mounted while closed (so its close transition can
   * animate), which means without this its links and buttons would remain
   * Tab stops and screen-reader content while sitting invisible offscreen
   * — a keyboard user on mobile would tab into a drawer they can't see.
   * Applied imperatively rather than as a JSX prop because React 18
   * doesn't type `inert`.
   */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (isOpen) {
      container.removeAttribute("inert");
      container.removeAttribute("aria-hidden");
    } else {
      container.setAttribute("inert", "");
      container.setAttribute("aria-hidden", "true");
    }
  }, [isOpen, containerRef]);

  useEffect(() => {
    if (!isOpen) return;
    const container = containerRef.current;
    if (!container) return;

    // Captured before focus moves into the panel, so it's still the
    // trigger (the hamburger button) rather than something inside.
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    /**
     * Re-queried on every Tab rather than cached once: the panel's
     * focusable set is not static (the WhatsApp/phone links render
     * conditionally on CMS data, and a locale switch re-renders the
     * toggle). `getClientRects()` filters out anything a stylesheet has
     * hidden — a `display:none` element matches the selector but must
     * never be a Tab stop.
     */
    const getFocusable = () =>
      Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
        (element) => element.getClientRects().length > 0,
      );

    getFocusable()[0]?.focus();

    const background = Array.from(document.querySelectorAll<HTMLElement>(BACKGROUND_SELECTOR));
    // `inert` (rather than aria-hidden) suppresses pointer, keyboard, and
    // assistive-tech access in one attribute. Set via setAttribute so an
    // unsupporting browser simply ignores it — the focus trap below, not
    // this, is what actually guarantees keyboard containment.
    background.forEach((element) => element.setAttribute("inert", ""));

    // An arrow const rather than a `function` declaration so it isn't
    // hoisted above the `if (!container) return` guard above — a hoisted
    // declaration loses that narrowing and `container` reads as nullable.
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = getFocusable();
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (!container.contains(document.activeElement)) {
        event.preventDefault();
        first.focus();
        return;
      }
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
        return;
      }
      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    // Scroll lock, applied to <html> rather than <body>: globals.css sets
    // `overflow-x: hidden` on html, and the CSS viewport-propagation rule
    // only hands body's overflow to the viewport while html's own overflow
    // is `visible`. With html already non-visible, `body{overflow:hidden}`
    // is inert here — verified: the page still scrolled behind an open
    // drawer. The scrollbar's width is replaced as padding so removing it
    // doesn't shift the fixed header sideways.
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    const previousPaddingInlineEnd = root.style.paddingInlineEnd;
    const scrollbarWidth = window.innerWidth - root.clientWidth;
    root.style.overflow = "hidden";
    if (scrollbarWidth > 0) root.style.paddingInlineEnd = `${scrollbarWidth}px`;

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      root.style.overflow = previousOverflow;
      root.style.paddingInlineEnd = previousPaddingInlineEnd;
      background.forEach((element) => element.removeAttribute("inert"));
      trigger?.focus();
    };
  }, [isOpen, containerRef]);
}
