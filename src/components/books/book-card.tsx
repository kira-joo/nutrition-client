import Image from "next/image";
import { ArrowLeft, BookOpen } from "lucide-react";
import type { PublicBookListItem } from "@/lib/domain/book";
import { Link } from "@/i18n/navigation";
import { appHref } from "@/constant/AppRoute.enum";

export interface BookCardProps {
  book: PublicBookListItem;
  /** Only the first row of the first page should be eager (matches RecipeCard/VideoCard). */
  priority?: boolean;
}

/**
 * Same soft-paper card family as `RecipeCard`/`VideoCard` (docs/design-system.md),
 * but a portrait `aspect-[5/7]` cover — close to the physical A5 page ratio
 * (`geometry.ts`) rather than the landscape 4:3/16:9 ratio those two use —
 * so the grid reads as a shelf of real books, not a reused recipe/video
 * layout with book covers dropped in.
 *
 * Always goes straight to the Arabic canonical (`locale="ar"`): a book card
 * is only ever rendered on the `/ar/books` listing, but linking through
 * `appHref.book()` without an explicit locale would still resolve against
 * whatever locale is currently active if this component is ever reused
 * elsewhere — the explicit override makes "this always lands on the
 * Arabic reader" true by construction, not by where it happens to be used.
 *
 * Title and description reserve a fixed two-line height each, and the
 * "read now" row is real content (not a hover-only affordance) — a book
 * cover alone doesn't imply "click to read" the way a video thumbnail's
 * play button does, so unlike RecipeCard this needs an explicit CTA line.
 */
export function BookCard({ book, priority = false }: BookCardProps) {
  const description = book.shortDescription || book.subtitle;

  return (
    <Link
      href={appHref.book(book.slug)}
      locale="ar"
      className="group flex h-full flex-col overflow-hidden rounded-xl border-hairline border-border bg-surface shadow-sm transition-shadow duration-base ease-standard hover:shadow-md"
    >
      <div className="relative aspect-[5/7] bg-surface-muted">
        {book.coverImage?.secureUrl ? (
          <Image
            src={book.coverImage.secureUrl}
            alt={book.title}
            fill
            sizes="(min-width: 1024px) 18rem, (min-width: 640px) 30vw, 45vw"
            className="object-cover"
            priority={priority}
            placeholder={book.coverImage.placeholderUrl ? "blur" : undefined}
            blurDataURL={book.coverImage.placeholderUrl}
          />
        ) : (
          <span aria-hidden="true" className="flex h-full items-center justify-center text-text-muted">
            <BookOpen className="size-icon-lg" />
          </span>
        )}

        {book.category && (
          <span className="absolute bottom-2 start-2 rounded-full bg-surface/90 px-2.5 py-1 text-caption font-semibold text-text-primary backdrop-blur">
            {book.category}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3
          className="min-w-0 break-words text-body-lg font-semibold text-text-primary transition-colors duration-fast group-hover:text-primary"
          style={{ minHeight: "calc(var(--leading-body-lg) * 2em)" }}
        >
          {book.title}
        </h3>
        <p
          className="line-clamp-2 min-w-0 break-words text-body-sm text-text-secondary"
          style={{ minHeight: "calc(var(--leading-body-sm) * 2em)" }}
        >
          {description}
        </p>

        <span className="mt-auto flex items-center gap-1.5 pt-3 text-body-sm font-semibold text-primary">
          اقرأ الآن
          <ArrowLeft
            aria-hidden="true"
            className="size-icon-sm motion-safe:transition-transform motion-safe:duration-base motion-safe:ease-standard motion-safe:group-hover:-translate-x-1"
          />
        </span>
      </div>
    </Link>
  );
}
