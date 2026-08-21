import { BookOpen } from "lucide-react";
import type { PaginatedResponse } from "@kira-joo/toolkit-common";
import type { PublicBookListItem } from "@/lib/domain/book";
import AppRoute from "@/constant/AppRoute.enum";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Reveal, RevealGroup } from "@/components/ui/reveal";
import { BookCard } from "@/components/books/book-card";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyPanel } from "@/components/ui/empty-panel";
import { PaginationNav } from "@/components/ui/pagination-nav";

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
          <Reveal>
            <PageHeader
              title="الكتب"
              description="دليل غذائي وصحي متكامل، مكتوب بعناية ومتاح للقراءة التفاعلية أو التحميل كملف PDF."
            />
          </Reveal>

          <div className="mt-10">
            {result.data.length === 0 ? (
              <EmptyBooks />
            ) : (
              <RevealGroup as="ul" className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 lg:gap-8">
                {result.data.map((book, index) => (
                  <li key={book.slug} className="flex">
                    <BookCard headingLevel="h2" book={book} priority={page === 1 && index < 4} />
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
    <EmptyPanel icon={BookOpen} message="لا توجد كتب منشورة حتى الآن. تفقدي الصفحة قريبًا." />
  );
}

/** Real links, not buttons — a page is a distinct, shareable URL (mirrors Recipes'/Videos' pagination). Always the Arabic canonical, per `BookCard`'s own reasoning. */
function Pagination({ page, totalPages }: { page: number; totalPages: number }) {
  return (
    <PaginationNav
      page={page}
      totalPages={totalPages}
      buildHref={(target) => `${AppRoute.Books}?page=${target}`}
      ariaLabel="صفحات الكتب"
      previousLabel="السابق"
      nextLabel="التالي"
      pageLabel={`صفحة ${page} من ${totalPages}`}
      locale="ar"
      className="mt-10"
    />
  );
}
