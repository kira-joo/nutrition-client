"use client";
import { useEffect } from "react";

/**
 * Suppresses the browser context menu while mounted — a deterrent against the
 * casual "Save audio as…" path, nothing more. It does not stop dev tools, the
 * network panel, keyboard shortcuts, or a screen recorder, and nothing
 * client-side can. Mounted only by the standalone lectures layout, so the rest
 * of the site keeps its normal context menu.
 */
export function ContextMenuGuard() {
  useEffect(() => {
    const prevent = (event: MouseEvent) => event.preventDefault();
    document.addEventListener("contextmenu", prevent);
    return () => document.removeEventListener("contextmenu", prevent);
  }, []);
  return null;
}
