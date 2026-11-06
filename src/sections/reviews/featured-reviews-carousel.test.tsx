import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { LocalizedReview } from "@/lib/domain/review";
import { INTERVALS_MS } from "@/lib/animation/motion-tokens";
import { FeaturedReviewsCarousel } from "./featured-reviews-carousel";

/**
 * The hook's own tests cover the state machine. This file covers the part the
 * hook cannot: **which element the pause handlers are attached to.**
 *
 * That distinction is the whole reason this file exists. The first version of
 * this carousel spread the hover/focus handlers over the entire component, so
 * the pause control suspended autoplay merely by being focused — and focus stays
 * on a button after a click, so pressing "resume" did nothing until focus
 * happened to move elsewhere. A hook test cannot catch that: it fires focus
 * events by hand, so it never reproduces "the button is inside the paused
 * region". Only rendering the real component and really clicking the real button
 * does.
 *
 * Embla is faked because it measures layout to initialise, which jsdom has none
 * of — the real hook would hand back an undefined api and every assertion here
 * would pass while testing nothing.
 */

const scrollNext = vi.fn();
const scrollTo = vi.fn();
let emblaListeners: Map<string, Set<(api: unknown) => void>>;
let emblaApi: unknown;
let emblaRef: unknown;
let emblaRootNode: HTMLElement;
let atEnd = false;

/** Real Embla hands its api to every handler, and the component's `onSelect` reads it. */
const emitEmbla = (event: string) => act(() => emblaListeners.get(event)?.forEach((handler) => handler(emblaApi)));

/**
 * The api, the ref and the root node are built once per test and returned
 * unchanged on every render, because that is what the real hook does. Handing
 * back fresh objects each render would make every state update look like an
 * Embla re-initialisation: effects would resubscribe for reasons production
 * never produces, and a new observer target would appear on each render — a fake
 * that makes the tests look stronger than they are.
 */
vi.mock("embla-carousel-react", () => ({
  default: () => [emblaRef, emblaApi],
}));

vi.mock("next-intl", () => ({
  /* Identity translations: these assertions are about behaviour, and pinning
     them to Arabic copy would make them fail on a wording change. */
  useTranslations: () => (key: string) => key,
}));

vi.mock("@/hooks/useIsRtl", () => ({ useIsRtl: () => false }));

function review(id: string): LocalizedReview {
  return {
    _id: id,
    authorName: `Author ${id}`,
    authorLabel: "Client",
    content: "A testimonial.",
    featured: true,
    rating: 5,
  } as LocalizedReview;
}

let intersect: (isIntersecting: boolean) => void;

beforeEach(() => {
  vi.useFakeTimers();
  scrollNext.mockClear();
  scrollTo.mockClear();
  emblaListeners = new Map();
  atEnd = false;
  emblaRef = vi.fn();
  emblaRootNode = document.createElement("div");
  const api: Record<string, unknown> = {
    rootNode: () => emblaRootNode,
    canScrollNext: () => !atEnd,
    canScrollPrev: () => true,
    scrollNext,
    scrollTo,
    scrollPrev: vi.fn(),
    on(event: string, handler: (a: unknown) => void) {
      if (!emblaListeners.has(event)) emblaListeners.set(event, new Set());
      emblaListeners.get(event)!.add(handler);
      return api;
    },
    off(event: string, handler: (a: unknown) => void) {
      emblaListeners.get(event)?.delete(handler);
      return api;
    },
  };
  emblaApi = api;

  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));

  const callbacks = new Set<(entries: { isIntersecting: boolean }[]) => void>();
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      private readonly callback: (entries: { isIntersecting: boolean }[]) => void;
      constructor(callback: (entries: { isIntersecting: boolean }[]) => void) {
        this.callback = callback;
        callbacks.add(callback);
      }
      observe() {}
      /* Really detaches — a no-op disconnect leaves stale callbacks firing and
         quietly changes what the tests are observing. */
      disconnect() {
        callbacks.delete(this.callback);
      }
    },
  );
  intersect = (isIntersecting) => act(() => callbacks.forEach((cb) => cb([{ isIntersecting }])));
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

/** A real press focuses the control before activating it; both matter here. */
function press(button: HTMLElement) {
  act(() => button.focus());
  fireEvent.click(button);
}

const dwell = (times = 1) =>
  act(() => {
    vi.advanceTimersByTime(INTERVALS_MS.slideDwell * times);
  });

function renderCarousel() {
  const view = render(<FeaturedReviewsCarousel reviews={[review("1"), review("2"), review("3")]} />);
  intersect(true);
  return view;
}

describe("FeaturedReviewsCarousel", () => {
  it("renders nothing below three reviews, so a one-slide carousel never appears", () => {
    const { container } = render(<FeaturedReviewsCarousel reviews={[review("1"), review("2")]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("advances on its own once mounted and in view", () => {
    renderCarousel();
    dwell();
    expect(scrollNext).toHaveBeenCalledTimes(1);
  });

  /**
   * The regression this file exists for. A real click focuses the button first,
   * so `press` is modelled as focus-then-click; React routes `onFocus` through
   * the bubbling `focusin`, which means a handler on an ancestor really does
   * fire. If the focus-pause region includes the control, autoplay stays stopped
   * and the button looks broken.
   */
  it("resumes when the pause control is pressed twice, with focus left on it", () => {
    renderCarousel();

    press(screen.getByRole("button", { name: "featured.pauseAutoplay" }));
    dwell(2);
    expect(scrollNext).not.toHaveBeenCalled();

    const resume = screen.getByRole("button", { name: "featured.playAutoplay" });
    expect(document.activeElement).toBe(resume);

    /* Pressed again without anything moving focus away first. */
    press(resume);
    dwell();
    expect(scrollNext).toHaveBeenCalledTimes(1);
  });

  it("keeps advancing while the pointer rests on the controls, and stops over the slides", () => {
    renderCarousel();

    fireEvent.mouseEnter(screen.getByRole("button", { name: "featured.pauseAutoplay" }));
    dwell();
    expect(scrollNext).toHaveBeenCalledTimes(1);

    /* The slides region is the element wrapping the reviews list. */
    fireEvent.mouseEnter(screen.getByRole("list").parentElement!);
    dwell(2);
    expect(scrollNext).toHaveBeenCalledTimes(1);
  });

  it("offers a restart at the end, and taking it scrolls back to the first slide", () => {
    renderCarousel();

    atEnd = true;
    emitEmbla("select");

    press(screen.getByRole("button", { name: "featured.restartAutoplay" }));
    expect(scrollTo).toHaveBeenCalledWith(0);
  });

  it("renders no autoplay control at all under prefers-reduced-motion", () => {
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: query.includes("prefers-reduced-motion: reduce"),
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }));
    renderCarousel();

    expect(screen.queryByRole("button", { name: /Autoplay/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "featured.pauseAutoplay" })).not.toBeInTheDocument();
    dwell(2);
    expect(scrollNext).not.toHaveBeenCalled();
  });
});
