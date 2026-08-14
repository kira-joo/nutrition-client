import { ArrowRight } from "lucide-react";
import type { Book } from "@/lib/domain/book";
import AppRoute from "@/constant/AppRoute.enum";
import { Container } from "@/components/ui/container";
import { Link } from "@/i18n/navigation";
import { Flipbook } from "./flipbook/flipbook";

/**
 * A thin Server Component wrapper — nearly all of the reader is
 * necessarily interactive (page-turns, keyboard, touch, zoom), so unlike
 * `RecipeDetail`'s split there is very little static markup to keep out
 * of the client bundle. Still kept as its own file/boundary so the route
 * `page.tsx` stays a plain fetch-and-notFound shell.
 *
 * The "back to books" link lives here, outside `Flipbook`'s own
 * `.book-page-scope` root — that class resets margin/padding on every
 * descendant to match the print template, which would fight a nav link
 * placed inside it. Added now that Phase I gives the reader somewhere to
 * go back to; `ArrowRight` (not `ArrowLeft` + an `rtl:` flip like
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
      <Flipbook book={book} />
    </div>
  );
}
