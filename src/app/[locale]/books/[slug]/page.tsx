import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getBook } from "@/lib/data";
import { BookReader } from "@/components/books/book-reader";
import { buildArabicOnlyAlternates, buildOgImage } from "@/lib/seo/metadata";
import { appHref } from "@/constant/AppRoute.enum";

interface BookPageProps {
  params: { locale: string; slug: string };
}

/**
 * A dedicated `generateMetadata` — unlike the campaign/recipe detail
 * pages, which rely on the root layout's fallback title/description —
 * because Books needs the Arabic-only alternates (`buildArabicOnlyAlternates`,
 * no `languages` map) instead of the bilingual `buildAlternates` the root
 * layout would otherwise apply; that's wrong here specifically, not
 * merely redundant, since English never actually renders this content.
 */
export async function generateMetadata({ params }: BookPageProps): Promise<Metadata> {
  const book = await getBook(params.slug);
  if (!book) return {};

  return {
    title: book.title,
    description: book.shortDescription || book.subtitle || book.title,
    alternates: buildArabicOnlyAlternates(appHref.book(params.slug)),
    openGraph: {
      title: book.title,
      description: book.shortDescription || book.subtitle || book.title,
      images: buildOgImage(book.coverImage),
    },
  };
}

/**
 * Deliberately a plain, unwrapped async Server Component — no `Suspense`
 * boundary, no sibling `loading.tsx` for this exact segment — matching
 * `/campaigns/[slug]/page.tsx` and `/recipes/[id]/page.tsx` exactly: once
 * a response starts streaming, Next has already committed the HTTP
 * status, so an inner `notFound()` would otherwise render as a 200.
 */
export default async function BookPage({ params }: BookPageProps) {
  const book = await getBook(params.slug);
  if (!book) notFound();

  return <BookReader book={book} />;
}
