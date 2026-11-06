"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { UseEmblaCarouselType } from "embla-carousel-react";
import { INTERVALS_MS } from "@/lib/animation/motion-tokens";
import { usePrefersReducedMotion } from "@/lib/animation/use-prefers-reduced-motion";

/**
 * Derived from the hook's return type, not imported from `embla-carousel`. That
 * package is only a transitive dependency of `embla-carousel-react`, so naming it
 * directly is a phantom dependency that resolves under npm's flat hoisting and
 * breaks under strict resolution — the same reasoning as in
 * `featured-reviews-carousel.tsx`, which learned it first.
 */
type EmblaApi = NonNullable<UseEmblaCarouselType[1]>;

/** What pressing the control will do, which is also what its label says. */
export type AutoplayAction = "pause" | "resume" | "restart";

export interface CarouselAutoplay {
  action: AutoplayAction;
  press: () => void;
  /**
   * False when autoplay can never run in this session, so the caller can omit
   * the control entirely rather than render a button that pauses nothing.
   */
  isAvailable: boolean;
  /**
   * Spread onto the **slides** region only, never onto the controls. See the
   * note on scoping below — this is the difference between a resume button that
   * works and one that silently does nothing.
   */
  slidesProps: {
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onFocus: () => void;
    onBlur: (event: React.FocusEvent<HTMLElement>) => void;
  };
}

/**
 * Autoplay for the featured-reviews strip, kept local to it: this is the site's
 * only carousel, so a shared hook would be one consumer's implementation wearing
 * a general name. If a second carousel appears, this moves to `lib/animation`.
 *
 * Hand-rolled rather than pulling in `embla-carousel-autoplay`, because almost
 * all of the requirement is about *when not to run*, and that is the part a
 * plugin's option names would obscure.
 *
 * **Three kinds of "stopped", deliberately not collapsed into one flag.** An
 * earlier version used a single `isPlaying` boolean for all of them and had a
 * bug that only a keyboard exposed: pressing "resume" left focus on the button,
 * the button sat inside the focus-paused region, so the timer stayed stopped and
 * the control appeared to do nothing. The three are now separate:
 *
 *   - `userPaused` — a deliberate decision, which outranks everything and
 *     persists. Moving the pointer away does not undo it.
 *   - transient suspensions — hover, focus-within-the-slides, off screen, hidden
 *     tab, mid-drag. Self-clearing, and never sticky.
 *   - `atEnd` — terminal. The carousel does not loop, so there is nowhere to go.
 *
 * **Hover and focus are scoped to the slides, not the whole component.** Their
 * job is to not interrupt someone *reading a card* or tabbing through its links.
 * A control that exists to govern autoplay is not that, and including it is what
 * caused the bug above — for the pointer too, where resuming only took effect
 * once the mouse happened to leave.
 *
 * **Terminal state is a third action, not a disabled button.** At the last slide
 * the control offers "restart", which returns to the first slide and resumes.
 * The alternative — leaving it saying "resume" — is a control that looks
 * functional and does nothing, since resuming at the end immediately re-stops.
 *
 * **Drag and manual navigation reset the dwell.** Touch produces no
 * `mouseenter`, so pointer hover cannot cover a finger drag; Embla's own
 * `pointerDown`/`pointerUp` do. And any `select` — a drag, or a tap on
 * next/previous — restarts the interval, so a visitor who advances manually
 * gets a full dwell to read rather than being advanced again a moment later.
 *
 * **It does not run at all under `prefers-reduced-motion`.**
 * `docs/motion-system.md` treats reduced motion as a first-class mode rather
 * than a downgrade, and content that moves on its own simply does not. Read
 * through `usePrefersReducedMotion` so a mid-session OS change takes effect —
 * Motion's own `useReducedMotion` snapshots once and would leave a live timer
 * behind.
 *
 * **It stops while off screen or the tab is hidden.** Partly to avoid animating
 * what nobody can see, but mainly so a visitor who scrolls away and comes back
 * does not find a different slide, having "missed" content that moved without
 * them.
 */
export function useCarouselAutoplay(emblaApi: EmblaApi | undefined): CarouselAutoplay {
  const prefersReducedMotion = usePrefersReducedMotion();

  const [userPaused, setUserPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocusWithinSlides, setIsFocusWithinSlides] = useState(false);
  const [isOnScreen, setIsOnScreen] = useState(false);
  const [isTabVisible, setIsTabVisible] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [atEnd, setAtEnd] = useState(false);
  /** Bumped to restart the dwell from zero after any real navigation. */
  const [dwellEpoch, setDwellEpoch] = useState(0);

  /* Terminal state and dwell resets both come from Embla's own events, which
     survive `reInit` — so this subscribes once per api instance. */
  useEffect(() => {
    if (!emblaApi) return;
    const syncEnd = () => setAtEnd(!emblaApi.canScrollNext());
    const restartDwell = () => setDwellEpoch((epoch) => epoch + 1);
    const onPointerDown = () => setIsDragging(true);
    const onPointerUp = () => {
      setIsDragging(false);
      restartDwell();
    };

    syncEnd();
    emblaApi
      .on("select", syncEnd)
      .on("select", restartDwell)
      .on("reInit", syncEnd)
      .on("pointerDown", onPointerDown)
      .on("pointerUp", onPointerUp);
    return () => {
      emblaApi
        .off("select", syncEnd)
        .off("select", restartDwell)
        .off("reInit", syncEnd)
        .off("pointerDown", onPointerDown)
        .off("pointerUp", onPointerUp);
    };
  }, [emblaApi]);

  const rootNode = emblaApi?.rootNode();
  useEffect(() => {
    if (!rootNode) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsOnScreen(entry.isIntersecting),
      /* Any part visible counts — a partly-visible strip is still being read. */
      { threshold: 0 },
    );
    observer.observe(rootNode);
    return () => observer.disconnect();
  }, [rootNode]);

  useEffect(() => {
    const onVisibilityChange = () => setIsTabVisible(document.visibilityState === "visible");
    onVisibilityChange();
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  const action: AutoplayAction = atEnd ? "restart" : userPaused ? "resume" : "pause";

  const press = useCallback(() => {
    if (atEnd) {
      emblaApi?.scrollTo(0);
      setUserPaused(false);
      return;
    }
    setUserPaused((paused) => !paused);
  }, [atEnd, emblaApi]);

  const shouldRun =
    !prefersReducedMotion &&
    !userPaused &&
    !atEnd &&
    !isHovered &&
    !isFocusWithinSlides &&
    !isDragging &&
    isOnScreen &&
    isTabVisible;

  /* Held in a ref so the interval callback always sees the live api without the
     timer being torn down and restarted on every Embla re-init. */
  const emblaRef = useRef(emblaApi);
  emblaRef.current = emblaApi;

  useEffect(() => {
    if (!shouldRun) return;
    const timer = window.setInterval(() => emblaRef.current?.scrollNext(), INTERVALS_MS.slideDwell);
    return () => window.clearInterval(timer);
    /* `dwellEpoch` is a dependency on purpose: it restarts the timer so a
       manual advance gets a full dwell rather than the remainder of one. */
  }, [shouldRun, dwellEpoch]);

  return {
    action,
    press,
    isAvailable: !prefersReducedMotion,
    slidesProps: {
      onMouseEnter: () => setIsHovered(true),
      onMouseLeave: () => setIsHovered(false),
      /* React's synthetic focus/blur propagate even though the native events do
         not, so these plain handlers see focus on a link inside a slide. */
      onFocus: () => setIsFocusWithinSlides(true),
      onBlur: (event) => {
        /* Only a focus move that actually leaves the slides resumes it — moving
           between two links inside them must not flicker the timer. A null
           `relatedTarget` (focus leaving the document) counts as leaving. */
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsFocusWithinSlides(false);
        }
      },
    },
  };
}
