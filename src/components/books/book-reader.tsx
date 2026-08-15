import { Suspense } from "react";
import { ArrowRight } from "lucide-react";
import type { Book } from "@/lib/domain/book";
import AppRoute from "@/constant/AppRoute.enum";
import { Container } from "@/components/ui/container";
import { Link } from "@/i18n/navigation";
import { BookReaderShell } from "./flipbook/book-reader-shell";

/**
 * A thin Server Component wrapper — nearly all of the reader is
 * necessarily interactive (page-turns, keyboard, touch, zoom, Book
 * Interaction mode), so unlike `RecipeDetail`'s split there is very
 * little static markup to keep out of the client bundle. Still kept as
 * its own file/boundary so the route `page.tsx` stays a plain
 * fetch-and-notFound shell.
 *
 * `Suspense` here is required by Next for `BookReaderShell`'s
 * `useSearchParams()` (the `?read=1` Book Interaction state) — it does
 * NOT reintroduce the notFound()-status-code problem `page.tsx`'s own
 * doc comment warns about: that gap comes specifically from a
 * segment-level `loading.tsx` wrapping the route BEFORE the server
 * component's own `await getBook()` / `notFound()` resolves. This
 * boundary sits entirely inside the already-resolved response, after
 * `notFound()` has already had its chance to run.
 *
 * The "back to books" link lives here, outside the shell's own
 * `.book-page-scope` root — that class resets margin/padding on every
 * descendant to match the print template, which would fight a nav link
 * placed inside it. It sits inside `<main>`, so `useDialogA11y`'s
 * existing background-suppression already inerts it while Book
 * Interaction mode's dialog is open, with no extra handling needed here.
 * `ArrowRight` (not `ArrowLeft` + an `rtl:` flip like
 * `video-detail.tsx`'s back link) because this page only ever renders
 * RTL — there's no LTR variant to mirror away from.
 */
export function BookReader({ book }: { book: Book }) {
  return (
    <div>
      <h1 className="sr-only">{book.title}</h1>
      <div dir="rtl">
        <Container width="wide" className="py-4">
          <Link
            href={AppRoute.Books}
            locale="ar"
            className="inline-flex items-center gap-2 text-body-sm font-semibold text-text-secondary transition-colors duration-fast hover:text-primary"
          >
            <ArrowRight className="size-icon-sm" aria-hidden="true" />
            كل الكتب
          </Link>
        </Container>
      </div>
      <Suspense fallback={null}>
        <BookReaderShell book={book} />
      </Suspense>
    </div>
  );
}
