"use client";
import { useEffect, useRef, useState } from "react";

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
export function useFitScale(containerRef: React.RefObject<HTMLElement | null>, contentRef: React.RefObject<HTMLElement | null>, deps: unknown[]): number {
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
      setScale(Math.min(1, widthScale, heightScale));
    }

    recompute();
    const observer = new ResizeObserver(recompute);
    observer.observe(container);
    observer.observe(content);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef, contentRef, ...deps]);

  return scale;
}
