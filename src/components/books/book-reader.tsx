import type { Book } from "@/lib/domain/book";
import { Flipbook } from "./flipbook/flipbook";

/**
 * A thin Server Component wrapper — nearly all of the reader is
 * necessarily interactive (page-turns, keyboard, touch, zoom), so unlike
 * `RecipeDetail`'s split there is very little static markup to keep out
 * of the client bundle. Still kept as its own file/boundary so the route
 * `page.tsx` stays a plain fetch-and-notFound shell.
 */
export function BookReader({ book }: { book: Book }) {
  return (
    <div>
      <h1 className="sr-only">{book.title}</h1>
      <Flipbook book={book} />
    </div>
  );
}
