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
 * Elements the drawer/dialog should suppress while open — the whole page
 * behind the panel. `header` is included because every dialog that uses
 * this hook is now portalled to `document.body` (never rendered as a
 * descendant of the header), so inerting it can't self-suppress the panel;
 * the guard just below (`!element.contains(container)`) still protects any
 * future non-portalled caller that forgets to portal.
 */
const BACKGROUND_SELECTOR = "main, footer, header";

export interface UseDialogA11yOptions {
  isOpen: boolean;
  /** Called on Escape. Kept in a ref internally, so an inline arrow at the call site won't re-run the effect. */
  onClose: () => void;
  /** The dialog surface itself — focus is confined within this element. */
  containerRef: RefObject<HTMLElement | null>;
  /**
   * Set false while `containerRef` isn't attached to a real DOM node yet.
   * A portalled dialog (this hook's only real-world caller) renders its
   * content one tick after mount (`Portal` defers to `document.body` via
   * its own `useMounted`), so on the render where `isOpen` first becomes
   * `true`, `containerRef.current` is still `null` — this hook's effects
   * see that, bail out via their own `!container` guard, and then never
   * run again, because neither `isOpen` nor the `containerRef` object
   * identity changes once the container actually mounts. That silently
   * skipped focus-move, the background `inert`, the Escape/Tab listener,
   * and the scroll lock on every affected dialog's first open — measured
   * on the mobile nav drawer after portalling it (plan §B/§11): closing
   * via the visible × button still worked (its effect depends on `isOpen`,
   * which does change), but Escape did nothing and focus never left the
   * trigger. Flipping this to `true` after mount re-runs both effects with
   * the container actually present. Defaults to `true` for a
   * non-portalled/synchronously-mounted container, which never had this gap.
   */
  ready?: boolean;
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
export function useDialogA11y({ isOpen, onClose, containerRef, ready = true }: UseDialogA11yOptions) {
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
    if (!ready) return;
    const container = containerRef.current;
    if (!container) return;

    if (isOpen) {
      container.removeAttribute("inert");
      container.removeAttribute("aria-hidden");
    } else {
      container.setAttribute("inert", "");
      container.setAttribute("aria-hidden", "true");
    }
  }, [isOpen, containerRef, ready]);

  useEffect(() => {
    if (!isOpen || !ready) return;
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
    const getFocusable = () => {
      const visible = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
        (element) => element.getClientRects().length > 0,
      );

      /**
       * A named radio group is a single tab stop, not one per option — the
       * browser tabs to the checked radio (or the first, if none is
       * checked) and arrow keys move within. Counting every radio made the
       * computed "last" element wrong, so Tab from the real last stop
       * escaped the dialog for one keystroke before the guard below pulled
       * it back. Collapsing each group to its tabbable member keeps the
       * wrap-around on the element the browser will actually land on.
       */
      const seenRadioGroups = new Set<string>();
      return visible.filter((element) => {
        const input = element as HTMLInputElement;
        if (input.type !== "radio" || !input.name) return true;
        if (seenRadioGroups.has(input.name)) return false;

        const group = visible.filter((other) => (other as HTMLInputElement).name === input.name);
        const tabbable = group.find((other) => (other as HTMLInputElement).checked) ?? group[0];
        if (element !== tabbable) return false;

        seenRadioGroups.add(input.name);
        return true;
      });
    };

    getFocusable()[0]?.focus();

    // Never suppress an ancestor of the dialog itself: a surface rendered
    // inside <main> would otherwise inert its own subtree, leaving it
    // visible but unfocusable — which is exactly what happened to the
    // recipe filter sheet until it was portalled out. Callers should still
    // portal a modal to the body; this guard just means forgetting to
    // degrades gracefully instead of silently breaking focus.
    const background = Array.from(document.querySelectorAll<HTMLElement>(BACKGROUND_SELECTOR)).filter(
      (element) => !element.contains(container)
    );
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
  }, [isOpen, containerRef, ready]);
}
