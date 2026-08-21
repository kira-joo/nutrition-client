import { act, render as rtlRender, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useCountUp } from "./use-count-up";
import { statNumberFormat, decimalsFor } from "./stat-number-format";
import { Locale } from "@/constant/Locale.enum";

/**
 * Motion is mocked so the tests can drive `inView` and `animate` directly. The
 * point is the *contract* around the tween — when it may run, what it formats,
 * and that it fires once — not Motion's own easing, which is Motion's to test.
 */
let inViewCalls: { onEnter: () => void; stop: ReturnType<typeof vi.fn> }[] = [];
let animateCalls: { from: number; to: number; options: Record<string, unknown> }[] = [];
const stopAnimation = vi.fn();

vi.mock("motion", () => ({
  inView: (_element: Element, onEnter: () => void) => {
    const stop = vi.fn();
    inViewCalls.push({ onEnter, stop });
    return stop;
  },
  animate: (from: number, to: number, options: Record<string, unknown>) => {
    animateCalls.push({ from, to, options });
    return { stop: stopAnimation };
  },
}));

let reduce = false;
const changeListeners = new Set<() => void>();

beforeEach(() => {
  inViewCalls = [];
  animateCalls = [];
  stopAnimation.mockClear();
  reduce = false;
  changeListeners.clear();
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: query.includes("prefers-reduced-motion: reduce") ? reduce : false,
    media: query,
    addEventListener: (_: string, handler: () => void) => changeListeners.add(handler),
    removeEventListener: (_: string, handler: () => void) => changeListeners.delete(handler),
  }));
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const setReducedMotion = (next: boolean) => {
  reduce = next;
  act(() => changeListeners.forEach((handler) => handler()));
};

/**
 * A stand-in for `StatFigure`: the ref has to be attached to a real element
 * during render, or the layout effect finds `ref.current` null and never
 * observes anything — which is also exactly how the real component uses it.
 */
function Probe({ value, locale }: { value: number; locale: Locale }) {
  const format = (n: number) => statNumberFormat(locale, decimalsFor(value)).format(n);
  const { ref, display } = useCountUp(value, format);
  return (
    <span ref={ref} data-testid="figure">
      {display}
    </span>
  );
}

function render(value: number, locale: Locale = Locale.AR) {
  const view = rtlRender(<Probe value={value} locale={locale} />);
  return {
    ...view,
    get display() {
      return screen.getByTestId("figure").textContent;
    },
  };
}

describe("useCountUp", () => {
  it("starts from the real formatted value, so the server HTML is already correct", () => {
    const view = render(1250);
    expect(view.display).toBe("1,250");
    /* Nothing has entered view yet, so nothing has animated. */
    expect(animateCalls).toHaveLength(0);
  });

  it("counts from zero to the value once the element enters view", () => {
    const view = render(1250);
    act(() => inViewCalls[0]?.onEnter());

    expect(animateCalls).toHaveLength(1);
    expect(animateCalls[0].from).toBe(0);
    expect(animateCalls[0].to).toBe(1250);
    expect(view.display).toBe("1,250");
  });

  it("formats every intermediate frame, not just the final value", () => {
    const view = render(1250);
    act(() => inViewCalls[0]?.onEnter());

    const onUpdate = animateCalls[0].options.onUpdate as (n: number) => void;
    act(() => onUpdate(612.4));
    /* Grouped and rounded — not a raw 612.4 leaking onto the page. */
    expect(view.display).toBe("612");
  });

  it("keeps a decimal stat's precision while counting", () => {
    const view = render(4.9);
    act(() => inViewCalls[0]?.onEnter());
    const onUpdate = animateCalls[0].options.onUpdate as (n: number) => void;
    act(() => onUpdate(2.3714));
    expect(view.display).toBe("2.4");
  });

  it("lands exactly on the real value rather than the last frame", () => {
    const view = render(38);
    act(() => inViewCalls[0]?.onEnter());
    const options = animateCalls[0].options as { onUpdate: (n: number) => void; onComplete: () => void };
    act(() => options.onUpdate(37.6));
    act(() => options.onComplete());
    expect(view.display).toBe("38");
  });

  it("never observes or animates under prefers-reduced-motion", () => {
    reduce = true;
    const view = render(1250);
    expect(inViewCalls).toHaveLength(0);
    expect(animateCalls).toHaveLength(0);
    /* The figure is still correct — it was correct before any script ran. */
    expect(view.display).toBe("1,250");
  });

  it("stops observing when the preference is turned on mid-session", () => {
    render(1250);
    const stop = inViewCalls[0].stop;
    setReducedMotion(true);
    expect(stop).toHaveBeenCalled();
  });

  it("does not re-register the observer on re-render, so the count cannot replay", () => {
    const view = render(1250);
    expect(inViewCalls).toHaveLength(1);
    act(() => inViewCalls[0]?.onEnter());
    view.rerender(<Probe value={1250} locale={Locale.AR} />);
    view.rerender(<Probe value={1250} locale={Locale.AR} />);
    expect(inViewCalls).toHaveLength(1);
    expect(animateCalls).toHaveLength(1);
  });

  it("stops the tween and the observer on unmount", () => {
    const view = render(1250);
    const stop = inViewCalls[0].stop;
    act(() => inViewCalls[0]?.onEnter());
    view.unmount();
    expect(stop).toHaveBeenCalled();
    expect(stopAnimation).toHaveBeenCalled();
  });

  /**
   * The bug this pins. `Intl.NumberFormat("ar")` resolves a different numbering
   * system on Node than in Chrome, so the server rendered ١٬٢٥٠ while the
   * browser counted 1,250 — the same figure in two digit sets, one of them read
   * aloud and the other on screen.
   */
  it("uses one pinned digit set, so server and client cannot disagree", () => {
    expect(statNumberFormat(Locale.AR).format(1250)).toBe("1,250");
    expect(statNumberFormat(Locale.EN).format(1250)).toBe("1,250");
  });
});
