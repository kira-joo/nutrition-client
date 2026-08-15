"use client";
import { useMemo, useState } from "react";
import type { PaginationResult } from "@/lib/books/render/page-model.interface";

export interface BookSearchResult {
  sequencePosition: number;
  snippet: string;
}

const SNIPPET_RADIUS = 40;
const MIN_QUERY_LENGTH = 2;

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Real full-text search across the book's own rendered page content —
 * not a decorative search icon. Strips markup once per page (memoized on
 * `pagination`, so typing doesn't re-parse every page's HTML on every
 * keystroke) and does a plain case-insensitive substring match, which is
 * sufficient for Arabic (no case to fold, no stemming attempted — a
 * simple, honest search rather than a half-built "smart" one).
 */
export function useBookSearch(pagination: PaginationResult | null) {
  const [query, setQuery] = useState("");

  const plainTextByPosition = useMemo(() => (pagination?.pages ?? []).map((page) => stripHtml(page.html)), [pagination]);

  const results = useMemo<BookSearchResult[]>(() => {
    const needle = query.trim().toLowerCase();
    if (needle.length < MIN_QUERY_LENGTH) return [];

    const found: BookSearchResult[] = [];
    plainTextByPosition.forEach((text, index) => {
      const matchIndex = text.toLowerCase().indexOf(needle);
      if (matchIndex === -1) return;
      const start = Math.max(0, matchIndex - SNIPPET_RADIUS);
      const end = Math.min(text.length, matchIndex + needle.length + SNIPPET_RADIUS);
      const snippet = `${start > 0 ? "…" : ""}${text.slice(start, end)}${end < text.length ? "…" : ""}`;
      found.push({ sequencePosition: index + 1, snippet });
    });
    return found;
  }, [plainTextByPosition, query]);

  return { query, setQuery, results };
}
