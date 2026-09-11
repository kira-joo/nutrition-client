import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { INTERVALS_MS } from "@/lib/animation/motion-tokens";
import { useCarouselAutoplay } from "./use-carousel-autoplay";

/**
 * These exercise the autoplay through the seams it actually has — the Embla api
 * it is handed, the reduced-motion media query, the intersection observer and
 * document visibility — and assert what an observer of the component could see:
 * whether the carousel advanced, and what the control offers to do next.
 *
 * They exist because this state machine is currently **unreachable through the
 * real route**: the strip renders only when at least three reviews are
 * `featured: true` in the CMS, and none are. Browser verification had to go
 * through a throwaway harness, which proves one session and protects nothing
 * afterwards. Two of the behaviours below were real bugs found in review, and
 * neither would have been caught by a test that only checked "does it advance".
 */

/** Minimal stand-in for the slice of Embla's api this hook actually uses. */
function createFakeEmbla() {
  const listeners = new Map<string, Set<() => void>>();
  const node = document.createElement("div");
  let canScrollNext = true;

  const api = {
    rootNode: () => node,
    canScrollNext: () => canScrollNext,
    scrollNext: vi.fn(),
    scrollTo: vi.fn(),
    on(event: string, handler: () => void) {
      if (!listeners.has(event)) listeners.set(event, new Set());
      listeners.get(event)!.add(handler);
      return api;
    },
    off(event: string, handler: () => void) {
      listeners.get(event)?.delete(handler);
      return api;
    },
  };

  return {
    /**
     * Cast once, deliberately: Embla's api has ~15 members and this double
     * implements only the six the hook touches. Filling in the rest would add
     * noise without adding coverage, and the cast is what keeps the double
     * honest about being partial.
     */
    api: api as unknown as NonNullable<Parameters<typeof useCarouselAutoplay>[0]>,
    /** Fire an Embla event, as the real carousel would. */
    emit(event: string) {
      act(() => {
        listeners.get(event)?.forEach((handler) => handler());
      });
    },
    setAtEnd(atEnd: boolean) {
      canScrollNext = !atEnd;
    },
  };
}

let setReducedMotion: (reduce: boolean) => void;
let intersect: (isIntersecting: boolean) => void;

beforeEach(() => {
  vi.useFakeTimers();

  /* A live media query, not a static one: the hook subscribes to `change`
     precisely so an OS-level toggle mid-session takes effect. */
  const changeListeners = new Set<() => void>();
  let reduce = false;
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: query.includes("prefers-reduced-motion: reduce") ? reduce : false,
    media: query,
    addEventListener: (_: string, handler: () => void) => changeListeners.add(handler),
    removeEventListener: (_: string, handler: () => void) => changeListeners.delete(handler),
  }));
  setReducedMotion = (next) => {
    reduce = next;
    act(() => changeListeners.forEach((handler) => handler()));
  };

  const observerCallbacks = new Set<(entries: { isIntersecting: boolean }[]) => void>();
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      private readonly callback: (entries: { isIntersecting: boolean }[]) => void;
      constructor(callback: (entries: { isIntersecting: boolean }[]) => void) {
        this.callback = callback;
        observerCallbacks.add(callback);
      }
      observe() {}
      /* Really detaches: a no-op disconnect leaves stale callbacks firing. */
      disconnect() {
        observerCallbacks.delete(this.callback);
      }
    },
  );
  intersect = (isIntersecting) => {
    act(() => observerCallbacks.forEach((callback) => callback([{ isIntersecting }])));
  };
});

/** Captured so an override cannot leak into later tests if one fails midway. */
const originalVisibility = Object.getOwnPropertyDescriptor(Document.prototype, "visibilityState");

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  if (originalVisibility) Object.defineProperty(document, "visibilityState", originalVisibility);
  else Reflect.deleteProperty(document, "visibilityState");
});

/** Renders the hook already on screen, which is the normal case. */
function renderOnScreen() {
  const embla = createFakeEmbla();
  const view = renderHook(() => useCarouselAutoplay(embla.api));
  intersect(true);
  return { embla, view };
}

const dwell = (times = 1) =>
  act(() => {
    vi.advanceTimersByTime(INTERVALS_MS.slideDwell * times);
  });

describe("carousel autoplay", () => {
  it("advances once per dwell while nothing is suppressing it", () => {
    const { embla } = renderOnScreen();
    dwell();
    expect(embla.api.scrollNext).toHaveBeenCalledTimes(1);
    dwell();
    expect(embla.api.scrollNext).toHaveBeenCalledTimes(2);
  });

  it("does not advance until the strip is on screen", () => {
    const embla = createFakeEmbla();
    renderHook(() => useCarouselAutoplay(embla.api));
    dwell(2);
    expect(embla.api.scrollNext).not.toHaveBeenCalled();

    intersect(true);
    dwell();
    expect(embla.api.scrollNext).toHaveBeenCalledTimes(1);
  });

  it("stops when the strip scrolls out of view and resumes when it returns", () => {
    const { embla } = renderOnScreen();
    intersect(false);
    dwell(2);
    expect(embla.api.scrollNext).not.toHaveBeenCalled();

    intersect(true);
    dwell();
    expect(embla.api.scrollNext).toHaveBeenCalledTimes(1);
  });

  describe("the pause control", () => {
    it("offers pause, then resume, and resuming actually resumes", () => {
      const { embla, view } = renderOnScreen();
      expect(view.result.current.action).toBe("pause");

      act(() => view.result.current.press());
      expect(view.result.current.action).toBe("resume");
      dwell(2);
      expect(embla.api.scrollNext).not.toHaveBeenCalled();

      act(() => view.result.current.press());
      expect(view.result.current.action).toBe("pause");
      dwell();
      expect(embla.api.scrollNext).toHaveBeenCalledTimes(1);
    });

    it("keeps a deliberate pause even after the pointer leaves the slides", () => {
      const { embla, view } = renderOnScreen();
      act(() => view.result.current.slidesProps.onMouseEnter());
      act(() => view.result.current.press());
      act(() => view.result.current.slidesProps.onMouseLeave());
      dwell(2);
      expect(embla.api.scrollNext).not.toHaveBeenCalled();
      expect(view.result.current.action).toBe("resume");
    });
  });

  describe("reaching the end", () => {
    it("offers a restart rather than a resume that would do nothing", () => {
      const { embla, view } = renderOnScreen();
      embla.setAtEnd(true);
      embla.emit("select");

      expect(view.result.current.action).toBe("restart");
      dwell(2);
      expect(embla.api.scrollNext).not.toHaveBeenCalled();
    });

    it("restarts from the first slide and starts advancing again", () => {
      const { embla, view } = renderOnScreen();
      embla.setAtEnd(true);
      embla.emit("select");

      act(() => view.result.current.press());
      expect(embla.api.scrollTo).toHaveBeenCalledWith(0);

      /* The real carousel emits `select` once it has scrolled back. */
      embla.setAtEnd(false);
      embla.emit("select");
      expect(view.result.current.action).toBe("pause");
      dwell();
      expect(embla.api.scrollNext).toHaveBeenCalled();
    });
  });

  describe("pointer drag", () => {
    it("does not advance mid-gesture", () => {
      const { embla } = renderOnScreen();
      embla.emit("pointerDown");
      dwell(2);
      expect(embla.api.scrollNext).not.toHaveBeenCalled();
    });

    it("resumes after the gesture ends, with a full dwell rather than the remainder", () => {
      const { embla } = renderOnScreen();
      embla.emit("pointerDown");
      embla.emit("pointerUp");

      act(() => {
        vi.advanceTimersByTime(INTERVALS_MS.slideDwell - 1);
      });
      expect(embla.api.scrollNext).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(1);
      });
      expect(embla.api.scrollNext).toHaveBeenCalledTimes(1);
    });
  });

  /**
   * A visitor who taps next themselves should get a whole dwell to read, not
   * whatever was left of the previous one.
   */
  it("restarts the dwell after a manual selection", () => {
    const { embla } = renderOnScreen();
    act(() => {
      vi.advanceTimersByTime(INTERVALS_MS.slideDwell - 500);
    });
    expect(embla.api.scrollNext).not.toHaveBeenCalled();

    embla.emit("select");

    /* Past where the original dwell would have fired, but not past the new one. */
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(embla.api.scrollNext).not.toHaveBeenCalled();

    dwell();
    expect(embla.api.scrollNext).toHaveBeenCalledTimes(1);
  });

  describe("prefers-reduced-motion", () => {
    it("never advances, and offers no control at all", () => {
      setReducedMotion(true);
      const embla = createFakeEmbla();
      const view = renderHook(() => useCarouselAutoplay(embla.api));
      intersect(true);

      dwell(3);
      expect(embla.api.scrollNext).not.toHaveBeenCalled();
      expect(view.result.current.isAvailable).toBe(false);
    });

    it("stops a running carousel when the preference is turned on mid-session", () => {
      const { embla, view } = renderOnScreen();
      dwell();
      expect(embla.api.scrollNext).toHaveBeenCalledTimes(1);

      setReducedMotion(true);
      expect(view.result.current.isAvailable).toBe(false);
      dwell(2);
      expect(embla.api.scrollNext).toHaveBeenCalledTimes(1);
    });

    it("starts again when the preference is turned back off", () => {
      setReducedMotion(true);
      const embla = createFakeEmbla();
      const view = renderHook(() => useCarouselAutoplay(embla.api));
      intersect(true);
      dwell(2);
      expect(embla.api.scrollNext).not.toHaveBeenCalled();

      setReducedMotion(false);
      expect(view.result.current.isAvailable).toBe(true);
      dwell();
      expect(embla.api.scrollNext).toHaveBeenCalledTimes(1);
    });
  });

  describe("focus and hover within the slides", () => {
    it("pauses while a control inside a slide has focus", () => {
      const { embla, view } = renderOnScreen();
      const slides = document.createElement("div");
      const link = document.createElement("a");
      slides.append(link);

      act(() => view.result.current.slidesProps.onFocus());
      dwell(2);
      expect(embla.api.scrollNext).not.toHaveBeenCalled();

      /* Focus moving somewhere outside the slides resumes it. */
      act(() =>
        view.result.current.slidesProps.onBlur({
          currentTarget: slides,
          relatedTarget: document.createElement("button"),
        } as unknown as React.FocusEvent<HTMLElement>),
      );
      dwell();
      expect(embla.api.scrollNext).toHaveBeenCalledTimes(1);
    });

    it("stays paused when focus moves between two elements inside the slides", () => {
      const { embla, view } = renderOnScreen();
      const slides = document.createElement("div");
      const first = document.createElement("a");
      const second = document.createElement("a");
      slides.append(first, second);

      act(() => view.result.current.slidesProps.onFocus());
      act(() =>
        view.result.current.slidesProps.onBlur({
          currentTarget: slides,
          relatedTarget: second,
        } as unknown as React.FocusEvent<HTMLElement>),
      );
      dwell(2);
      expect(embla.api.scrollNext).not.toHaveBeenCalled();
    });

    it("pauses on hover and resumes when the pointer leaves", () => {
      const { embla, view } = renderOnScreen();
      act(() => view.result.current.slidesProps.onMouseEnter());
      dwell(2);
      expect(embla.api.scrollNext).not.toHaveBeenCalled();

      act(() => view.result.current.slidesProps.onMouseLeave());
      dwell();
      expect(embla.api.scrollNext).toHaveBeenCalledTimes(1);
    });
  });

  describe("document visibility", () => {
    it("does not advance while the tab is hidden, and resumes when it returns", () => {
      const { embla } = renderOnScreen();
      const setVisibility = (state: DocumentVisibilityState) => {
        Object.defineProperty(document, "visibilityState", { value: state, configurable: true });
        act(() => document.dispatchEvent(new Event("visibilitychange")));
      };

      setVisibility("hidden");
      dwell(2);
      expect(embla.api.scrollNext).not.toHaveBeenCalled();

      setVisibility("visible");
      dwell();
      expect(embla.api.scrollNext).toHaveBeenCalledTimes(1);
    });
  });

  it("does nothing at all before Embla has initialised", () => {
    renderHook(() => useCarouselAutoplay(undefined));
    /* No api, no observer target, nothing to advance — and no crash. */
    expect(() => dwell(2)).not.toThrow();
  });
});
