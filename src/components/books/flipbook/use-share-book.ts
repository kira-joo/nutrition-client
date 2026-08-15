"use client";
import { useCallback, useState } from "react";

const COPIED_CONFIRMATION_MS = 2000;

/**
 * `navigator.share` (the real native share sheet) when available, else a
 * clipboard copy with a transient confirmation, else a silent no-op —
 * there is no third fallback UI to build here, and a broken-feeling
 * "Share" button that does nothing visible is worse than one that quietly
 * declines on a platform with neither API.
 *
 * Reads `window.location.href` fresh at call time rather than taking a
 * URL prop: sharing while Book Interaction mode's `?read=1` is in the
 * address bar should share a link that lands the recipient directly in
 * reading mode too, and a prop captured once at mount would go stale the
 * moment that query param changes.
 */
export function useShareBook(title: string) {
  const [copied, setCopied] = useState(false);

  const share = useCallback(async () => {
    if (typeof window === "undefined") return;
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // The visitor cancelled the native share sheet, or the platform
        // refused — neither is an error worth surfacing.
      }
      return;
    }

    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), COPIED_CONFIRMATION_MS);
      } catch {
        // Clipboard permission denied/unsupported — no fallback UI exists
        // beyond this; fail quietly rather than surface a broken-looking error.
      }
    }
  }, [title]);

  return { share, copied };
}
