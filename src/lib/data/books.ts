import { nullableOnNotFound } from "@kira-joo/frontend-toolkit-core/server";
import { getBookEndpoint } from "../../../api/books.endpoints";
import { fetchPublic } from "@/lib/api/fetch-public";
import { CacheTag } from "@/lib/cache/cache-tags";
import type { Book } from "@/lib/domain/book";

/**
 * No `localize()` — Books are Arabic-only from the architecture up (see
 * `src/lib/domain/book.ts`'s own doc comment), so the raw wire response
 * IS the final shape. `nullableOnNotFound` turns nutrition-staff's 404
 * (draft/unpublished/hidden book, or a genuinely nonexistent slug — the
 * public API deliberately never distinguishes the two) into `null`; the
 * calling page decides to call `notFound()`.
 */
export async function getBook(slug: string): Promise<Book | null> {
  return nullableOnNotFound<Book>(() =>
    fetchPublic(getBookEndpoint, {
      params: { slug },
      tags: [CacheTag.BOOKS, CacheTag.book(slug)],
    })
  );
}
