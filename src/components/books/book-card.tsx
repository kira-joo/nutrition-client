import Image from "next/image";
import { ArrowLeft, BookOpen } from "lucide-react";
import type { PublicBookListItem } from "@/lib/domain/book";
import { Link } from "@/i18n/navigation";
import { appHref } from "@/constant/AppRoute.enum";
import { MediaPill } from "@/components/ui/media-pill";
import { SURFACE_HOVER_ELEVATION, SURFACE_MEDIA_ZOOM, SURFACE_RAISED } from "@/components/ui/surface";
import { cn } from "@/lib/cn";

export interface BookCardProps {
  /**
   * Semantic depth only — the heading's visual size is the card's design and does
   * not move with it. `h3` is right under a section heading, as on the homepage
   * previews; a browse page whose own `h1` is the nearest heading above the grid
   * passes `h2`, because skipping a level makes the document outline claim a
   * nesting that isn't there.
   */
  headingLevel?: "h2" | "h3";
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
export function BookCard({ headingLevel: Heading = "h3", book, priority = false }: BookCardProps) {
  const description = book.shortDescription || book.subtitle;

  return (
    <Link
      href={appHref.book(book.slug)}
      locale="ar"
      className={cn("group flex h-full flex-col overflow-hidden", SURFACE_RAISED, SURFACE_HOVER_ELEVATION)}
    >
      <div className="relative aspect-[5/7] bg-surface-muted">
        {book.coverImage?.secureUrl ? (
          <Image
            src={book.coverImage.secureUrl}
            alt={book.title}
            fill
            sizes="(min-width: 1024px) 18rem, (min-width: 640px) 30vw, 45vw"
            className={cn("object-cover", SURFACE_MEDIA_ZOOM)}
            priority={priority}
            placeholder={book.coverImage.placeholderUrl ? "blur" : undefined}
            blurDataURL={book.coverImage.placeholderUrl}
          />
        ) : (
          <span aria-hidden="true" className="flex h-full items-center justify-center text-text-muted">
            <BookOpen className="size-icon-lg" />
          </span>
        )}

        {book.category && <MediaPill position="bottom-start">{book.category}</MediaPill>}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5">
        <Heading
          className="min-w-0 break-words text-body-lg font-semibold text-text-primary transition-colors duration-fast group-hover:text-primary"
          style={{ minHeight: "calc(var(--leading-body-lg) * 2em)" }}
        >
          {book.title}
        </Heading>
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
            className="size-icon-sm motion-safe:transition-transform motion-safe:duration-base motion-safe:ease-standard pointer:group-hover:-translate-x-1"
          />
        </span>
      </div>
    </Link>
  );
}
