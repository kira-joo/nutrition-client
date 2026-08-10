"use client";
import { useCallback, useRef, useState } from "react";

/**
 * Open/close state for `AssetLightbox`, plus the focus restoration it
 * deliberately leaves to its caller.
 *
 * `AssetViewer` claims to handle that, but verified in a real browser focus
 * lands on `<body>` after closing when a custom thumbnail is supplied —
 * which it always is here, so none of the package's Backoffice styling
 * reaches the public site. Extracted once there was a second consumer (the
 * gallery filmstrip and the recipe hero image) rather than duplicating the
 * ref bookkeeping in both.
 *
 * Focus returns to the trigger for the image last *viewed*, not strictly
 * the one clicked: after arrow-keying from image 1 to 5, landing back on 1
 * loses the user's place. With a single image, or no navigation, the two
 * are identical.
 */
export function useLightbox() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const triggersRef = useRef<Array<HTMLElement | null>>([]);

  const close = useCallback(() => {
    const returnTo = triggersRef.current[openIndex ?? 0];
    setOpenIndex(null);
    // Deferred a frame: the lightbox unmounts its portal during this
    // update, and focusing a node while that teardown is in flight gets
    // clobbered back to <body>.
    requestAnimationFrame(() => returnTo?.focus());
  }, [openIndex]);

  const registerTrigger = useCallback(
    (index: number) => (node: HTMLElement | null) => {
      triggersRef.current[index] = node;
    },
    []
  );

  return { openIndex, setOpenIndex, close, registerTrigger, isOpen: openIndex !== null };
}
