"use client";
import { useEffect, useState } from "react";
import type { Book } from "@/lib/domain/book";
import { paginateBook } from "@/lib/books/render/paginate-book";
import type { PaginationResult } from "@/lib/books/render/page-model.interface";

export interface UseBookPaginationResult {
  pagination: PaginationResult | null;
  status: "loading" | "ready" | "error";
}

/**
 * Runs the real, measurement-based paginator once per book, in the
 * visitor's own browser — the template CSS/fonts must already be
 * mounted in the DOM before this fires (the caller renders the
 * `<style>` tag synchronously on the same render; this hook only runs
 * in an effect, one tick later). Never re-runs for the same book unless
 * `book` itself changes identity (a new Edition would be a fresh page
 * load from the server anyway).
 */
export function useBookPagination(book: Book): UseBookPaginationResult {
  const [pagination, setPagination] = useState<PaginationResult | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    setPagination(null);

    paginateBook(book)
      .then((result) => {
        if (cancelled) return;
        setPagination(result);
        setStatus("ready");
      })
      .catch((error) => {
        if (cancelled) return;
        // eslint-disable-next-line no-console
        console.error("Book pagination failed", error);
        setStatus("error");
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [book.slug, book.publishedAt]);

  return { pagination, status };
}
