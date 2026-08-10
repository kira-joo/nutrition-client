import { useEffect, useLayoutEffect } from "react";

/**
 * Every reveal hook needs to hide its element *before paint*, or the
 * server-rendered (visible) HTML flashes on screen and then snaps to
 * `opacity: 0` once the effect runs — the plain `useEffect` this used to
 * use fires after paint, so that flash was real, not a perception issue.
 * `useLayoutEffect` fixes it, but warns on the server ("does nothing on
 * the server, did you mean useEffect?"); this is the standard swap that
 * avoids the warning while keeping the pre-paint timing in the browser,
 * where every one of these hooks actually runs (`"use client"`).
 */
export const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;
