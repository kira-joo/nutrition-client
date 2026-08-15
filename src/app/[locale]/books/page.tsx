import { Suspense } from "react";
import type { Metadata } from "next";
import { getBooks } from "@/lib/data";
import { parsePage } from "@/lib/pagination/parse-page";
import { buildArabicOnlyAlternates } from "@/lib/seo/metadata";
import AppRoute from "@/constant/AppRoute.enum";
import { BooksBrowser } from "@/sections/books/books-browser";
import { BooksBrowserSkeleton } from "@/sections/books/books-browser-skeleton";

interface BooksPageProps {
  searchParams: Record<string, string | string[] | undefined>;
}

const BOOKS_PER_PAGE = 12;

/**
 * A dedicated `generateMetadata`, for the same reason as `/books/[slug]`
 * (see that file's doc comment): the root layout's `buildAlternates` would
 * advertise an `/en/books` `hreflang` alternate that only ever 308s away.
 * Static Arabic copy, not a fetch — the listing's own title/intro never
 * depend on which books happen to be published.
 */
export function generateMetadata(): Metadata {
  return {
    title: "الكتب",
    description: "دليل غذائي وصحي متكامل، مكتوب بعناية ومتاح للقراءة التفاعلية أو التحميل كملف PDF.",
    alternates: buildArabicOnlyAlternates(AppRoute.Books),
  };
}

/**
 * `Suspense` here rather than a sibling `loading.tsx`, keyed on the page
 * number — same rationale as `/recipes` and `/videos` (a segment-level
 * `loading.tsx` would also stream `/books/[slug]`, which needs `notFound()`
 * to still set a real 404 status).
 */
export default function BooksPage({ searchParams }: BooksPageProps) {
  const page = parsePage(searchParams.page);

  return (
    <Suspense key={page} fallback={<BooksBrowserSkeleton />}>
      <BooksResults page={page} />
    </Suspense>
  );
}

async function BooksResults({ page }: { page: number }) {
  const result = await getBooks({ page, limit: BOOKS_PER_PAGE });
  return <BooksBrowser result={result} page={page} />;
}
