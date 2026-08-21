import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";

export interface PaginationNavProps {
  /** 1-indexed current page. Drives which edge, if any, renders disabled. */
  page: number;
  totalPages: number;
  /**
   * Builds the target href for a page number. Plain sections return a bare
   * `?page=N`; Recipes folds `page` back into its full filter set via
   * `toSearchParamsString` so next/prev never silently drops the visitor's
   * active filters. The component never assembles a URL itself.
   */
  buildHref: (targetPage: number) => string;
  ariaLabel: string;
  previousLabel: string;
  nextLabel: string;
  /**
   * Already-resolved "page X of Y" content. Composed by the caller, never
   * here — each section owns its own next-intl namespace and ICU message,
   * and Books' text is hardcoded Arabic with no message at all.
   */
  pageLabel: ReactNode;
  /**
   * Pins the Links to a fixed locale. Only Books needs this: `/books` is an
   * Arabic-only route with no English variant to ever fall back to.
   */
  locale?: "ar";
  /**
   * Extra classes for the `<nav>` itself. Outer vertical rhythm is page
   * composition, not pager behaviour — Books/Videos/Reviews sit directly
   * under a results grid and need their own top margin; Recipes' pager is
   * already a child of a `flex flex-col gap-6`, so it needs none.
   */
  className?: string;
}

/**
 * The previous/next pager shared by Books, Videos, Reviews and Recipes.
 *
 * Deliberately client-local, not a toolkit export (doc 02 §B2 proposed a
 * `PaginationNav` for `frontend-toolkit-tailwind`; superseded here). Confirmed
 * by both this workstream and an independent Codex pass: `nutrition-staff`
 * has zero URL-driven link pagination — its `Pagination` is a callback widget
 * over client-held page state, a different rendering model entirely — so a
 * shared-package version would have exactly one real consumer, which the
 * workspace's toolkit-first rule forbids.
 *
 * The four sites were **not** identical. Diffed character-by-character:
 * - **Touch sizing.** Recipes alone carried
 *   `touch:h-control-md touch:min-w-[6rem]` plus `justify-center` (to keep
 *   the label centred once the box widens under `touch:`); Books, Videos and
 *   Reviews shipped a bare 36px `h-control-sm` target with no touch
 *   compensation. There is no case where 36px was an intentional choice for
 *   those three — it was the same class string, just missing the fix — so
 *   the stronger treatment applies to all four rather than becoming a prop.
 * - **Href construction.** Recipes builds from
 *   `toSearchParamsString({ ...filters, page })` to preserve every active
 *   filter across a page change; the other three used a bare `?page=N`,
 *   which is correct for them since they carry no filter state at all. Kept
 *   as the `buildHref` callback so this is never flattened into one shape.
 * - **Locale pinning.** Books passes `locale="ar"` because it is an
 *   Arabic-only route; the other three let `Link` infer locale from the
 *   active route. Kept as the `locale` prop.
 * - **Outer spacing.** Books/Videos/Reviews add `mt-10`; Reviews and Recipes
 *   also add `pt-2` that Books/Videos don't. This is each page's own layout
 *   rhythm, not pager behaviour, so it stays the caller's `className`.
 * - **"Page X of Y" text.** Composed per-caller from each section's own
 *   next-intl namespace (or hardcoded Arabic on Books) — never here.
 *
 * The disabled edge stays a non-interactive `<span aria-disabled="true">`,
 * sized identically to the live link so the row never changes height at the
 * first or last page.
 */
export function PaginationNav({
  page,
  totalPages,
  buildHref,
  ariaLabel,
  previousLabel,
  nextLabel,
  pageLabel,
  locale,
  className,
}: PaginationNavProps) {
  const pagerBase =
    "inline-flex h-control-sm items-center justify-center rounded-full border-hairline px-4 text-body-sm font-semibold touch:h-control-md touch:min-w-[6rem]";
  const linkClass = cn(pagerBase, "border-border bg-surface text-text-primary hover:border-primary hover:text-primary");
  const disabledClass = cn(pagerBase, "border-border text-text-muted opacity-60");

  return (
    <nav aria-label={ariaLabel} className={cn("flex items-center justify-between gap-4", className)}>
      {page > 1 ? (
        <Link href={buildHref(page - 1)} locale={locale} className={linkClass} rel="prev">
          {previousLabel}
        </Link>
      ) : (
        <span className={disabledClass} aria-disabled="true">
          {previousLabel}
        </span>
      )}

      <span className="text-body-sm text-text-secondary">{pageLabel}</span>

      {page < totalPages ? (
        <Link href={buildHref(page + 1)} locale={locale} className={linkClass} rel="next">
          {nextLabel}
        </Link>
      ) : (
        <span className={disabledClass} aria-disabled="true">
          {nextLabel}
        </span>
      )}
    </nav>
  );
}
