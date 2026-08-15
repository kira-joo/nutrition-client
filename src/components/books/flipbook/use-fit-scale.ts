"use client";
import { useEffect, useRef, useState } from "react";

export interface UseFitScaleOptions {
  /**
   * Upper bound on the returned scale. Page mode leaves this at the
   * default `1` (a physical page never renders larger than its own real
   * mm size there); Book Interaction mode raises it so the book can
   * actually fill a large viewport instead of sitting at its printed
   * size in the middle of a big empty stage.
   */
  maxScale?: number;
  /**
   * Multiplies the computed scale, letting a caller leave deliberate
   * breathing room around the book instead of touching it edge-to-edge.
   * A multiplier rather than container padding: `getBoundingClientRect()`
   * measures the border box, so CSS padding on the stage would be counted
   * as available space and the content would overflow into it.
   */
  fillRatio?: number;
}

/**
 * Physical book pages are sized in real `mm` (matching the PDF/print
 * geometry exactly — see `geometry.ts`), so they render at a fixed CSS
 * pixel size regardless of viewport. This hook measures the natural
 * (unscaled) size of `contentRef` against the available space inside
 * `containerRef` and returns a `transform: scale()` factor so the spread
 * always fits — recalculated on resize via `ResizeObserver`, not a
 * fixed set of breakpoints, since "available width" is what the
 * approved plan's mobile/desktop split is actually keyed on.
 */
export function useFitScale(
  containerRef: React.RefObject<HTMLElement | null>,
  contentRef: React.RefObject<HTMLElement | null>,
  deps: unknown[],
  options: UseFitScaleOptions = {}
): number {
  const { maxScale = 1, fillRatio = 1 } = options;
  const [scale, setScale] = useState(1);
  const depsRef = useRef(deps);
  depsRef.current = deps;

  useEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;

    function recompute(): void {
      if (!container || !content) return;
      const previousTransform = content.style.transform;
      content.style.transform = "none";
      const contentRect = content.getBoundingClientRect();
      content.style.transform = previousTransform;

      const containerRect = container.getBoundingClientRect();
      if (contentRect.width === 0 || contentRect.height === 0) return;

      const widthScale = containerRect.width / contentRect.width;
      const heightScale = containerRect.height / contentRect.height;
      setScale(Math.min(maxScale, widthScale * fillRatio, heightScale * fillRatio));
    }

    recompute();
    const observer = new ResizeObserver(recompute);
    observer.observe(container);
    observer.observe(content);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef, contentRef, maxScale, fillRatio, ...deps]);

  return scale;
}
