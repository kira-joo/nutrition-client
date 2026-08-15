"use client";
import { useCallback, useEffect, useState } from "react";

function storageKey(slug: string): string {
  return `book-bookmark-${slug}`;
}

/**
 * One bookmark per book, persisted in `localStorage` — a real, working
 * feature (mark the current physical page, toggle it off, it survives a
 * reload), not a decorative icon. Keyed by `sequencePosition` (physical
 * position — see `page-model.interface.ts`'s `TocResultEntry` doc
 * comment), never the printed folio, so a bookmark on the cover or
 * another unnumbered page is representable at all.
 */
export function useBookBookmark(slug: string, currentSequencePosition: number) {
  const [bookmarkedPosition, setBookmarkedPosition] = useState<number | null>(null);

  useEffect(() => {
    const raw = window.localStorage.getItem(storageKey(slug));
    setBookmarkedPosition(raw ? Number(raw) : null);
  }, [slug]);

  const isBookmarked = bookmarkedPosition === currentSequencePosition;

  const toggle = useCallback(() => {
    if (isBookmarked) {
      window.localStorage.removeItem(storageKey(slug));
      setBookmarkedPosition(null);
    } else {
      window.localStorage.setItem(storageKey(slug), String(currentSequencePosition));
      setBookmarkedPosition(currentSequencePosition);
    }
  }, [isBookmarked, slug, currentSequencePosition]);

  return { isBookmarked, bookmarkedPosition, toggle };
}
