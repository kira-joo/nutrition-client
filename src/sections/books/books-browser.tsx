import { BookOpen } from "lucide-react";
import type { PaginatedResponse } from "@kira-joo/toolkit-common";
import type { PublicBookListItem } from "@/lib/domain/book";
import AppRoute from "@/constant/AppRoute.enum";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Reveal, RevealGroup } from "@/components/ui/reveal";
import { Link } from "@/i18n/navigation";
import { BookCard } from "@/components/books/book-card";

export interface BooksBrowserProps {
  result: PaginatedResponse<PublicBookListItem>;
  page: number;
}

/**
 * Modeled on `VideosGallery`, not `RecipesBrowser`: no search/filter UI.
 * A doctor publishes a handful of books, not hundreds of recipes — a
 * filter sidebar over a shelf of a dozen books would be furniture, not a
 * feature, exactly the reasoning `VideosGallery` already documents for
 * itself. All strings are hardcoded Arabic rather than routed through
 * next-intl, matching the rest of the Books feature (the Flipbook reader
 * does the same, approved in Phase H) — this page only ever renders under
 * `/ar/books`, so there is no second locale that would ever read an `en`
 * translation of it.
 */
export async function BooksBrowser({ result, page }: BooksBrowserProps) {
  const totalPages = result.totalPages ?? 1;

  return (
    <div dir="rtl">
      <Section>
        <Container>
          <Reveal className="flex flex-col items-start gap-3">
            <h1 className="text-display font-extrabold text-text-primary">الكتب</h1>
            <p className="max-w-narrow text-body text-text-secondary">
              دليل غذائي وصحي متكامل، مكتوب بعناية ومتاح للقراءة التفاعلية أو التحميل كملف PDF.
            </p>
          </Reveal>

          <div className="mt-10">
            {result.data.length === 0 ? (
              <EmptyBooks />
            ) : (
              <RevealGroup as="ul" className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 lg:gap-8">
                {result.data.map((book, index) => (
                  <li key={book.slug} className="flex">
                    <BookCard book={book} priority={page === 1 && index < 4} />
                  </li>
                ))}
              </RevealGroup>
            )}
          </div>

          {totalPages > 1 && <Pagination page={page} totalPages={totalPages} />}
        </Container>
      </Section>
    </div>
  );
}

function EmptyBooks() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border-hairline border-border bg-surface-muted px-6 py-14 text-center">
      <BookOpen aria-hidden="true" className="size-icon-xl text-text-muted" />
      <p className="max-w-md break-words text-body-lg font-semibold text-text-primary">لا توجد كتب منشورة حتى الآن. تفقدي الصفحة قريبًا.</p>
    </div>
  );
}

/** Real links, not buttons — a page is a distinct, shareable URL (mirrors Recipes'/Videos' pagination). Always the Arabic canonical, per `BookCard`'s own reasoning. */
function Pagination({ page, totalPages }: { page: number; totalPages: number }) {
  const linkClass =
    "inline-flex h-control-sm items-center rounded-full border-hairline border-border bg-surface px-4 text-body-sm font-semibold text-text-primary hover:border-primary hover:text-primary";
  const disabledClass =
    "inline-flex h-control-sm items-center rounded-full border-hairline border-border px-4 text-body-sm font-semibold text-text-muted opacity-60";

  return (
    <nav aria-label="صفحات الكتب" className="mt-10 flex items-center justify-between gap-4">
      {page > 1 ? (
        <Link href={`${AppRoute.Books}?page=${page - 1}`} locale="ar" className={linkClass} rel="prev">
          السابق
        </Link>
      ) : (
        <span className={disabledClass} aria-disabled="true">
          السابق
        </span>
      )}

      <span className="text-body-sm text-text-secondary">
        صفحة {page} من {totalPages}
      </span>

      {page < totalPages ? (
        <Link href={`${AppRoute.Books}?page=${page + 1}`} locale="ar" className={linkClass} rel="next">
          التالي
        </Link>
      ) : (
        <span className={disabledClass} aria-disabled="true">
          التالي
        </span>
      )}
    </nav>
  );
}
