"use client";
import { useEffect, useState } from "react";

/** A spread needs roughly 2 × 148mm (A5) to stay legible — below that, single-page mode. Keyed on available width via a real media query, never user-agent sniffing. */
const MOBILE_BREAKPOINT_QUERY = "(max-width: 900px)";

export function useIsMobileViewport(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_BREAKPOINT_QUERY);
    setIsMobile(mediaQuery.matches);
    const onChange = (event: MediaQueryListEvent) => setIsMobile(event.matches);
    mediaQuery.addEventListener("change", onChange);
    return () => mediaQuery.removeEventListener("change", onChange);
  }, []);

  return isMobile;
}
