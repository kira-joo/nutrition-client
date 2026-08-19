"use client";
import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function getSnapshot(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia(QUERY).matches;
}

function getServerSnapshot(): boolean {
  return false;
}

function subscribe(onChange: () => void): () => void {
  const mediaQueryList = window.matchMedia(QUERY);
  mediaQueryList.addEventListener("change", onChange);
  return () => mediaQueryList.removeEventListener("change", onChange);
}

/**
 * Motion's own `useReducedMotion()` (from `motion/react`) snapshots the
 * preference once via `useState` and never subscribes to a later OS-level
 * change — confirmed against the installed Motion 12.43 source, which
 * still carries a TODO about adding that. The old GSAP-based
 * `prefersReducedMotion()` read `matchMedia(...).matches` fresh on every
 * call, so toggling the setting mid-session changed the *next* drawer
 * open/close. `useSyncExternalStore` + a real `change` listener restores
 * that liveness without the caller needing to do anything differently.
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
