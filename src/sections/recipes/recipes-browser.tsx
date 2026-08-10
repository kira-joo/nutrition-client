import { getTranslations } from "next-intl/server";
import { SearchX, UtensilsCrossed } from "lucide-react";
import type { PaginatedResponse } from "@kira-joo/toolkit-common";
import type { LocalizedRecipe } from "@/lib/domain/recipe";
import type { LocalizedRecipeTaxonomyTerm } from "@/lib/domain/recipe-taxonomy";
import AppRoute from "@/constant/AppRoute.enum";
import { countActiveFilters, toSearchParamsString, type RecipeFilters } from "@/lib/recipes/recipe-search-params";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Link } from "@/i18n/navigation";
import { RecipeCard } from "@/components/recipes/recipe-card";
import { RecipeFilterPanel } from "@/components/recipes/recipe-filter-panel";
import { RecipeFilterSheet } from "@/components/recipes/recipe-filter-sheet";

export interface RecipesBrowserProps {
  result: PaginatedResponse<LocalizedRecipe>;
  categories: LocalizedRecipeTaxonomyTerm[];
  foodGroups: LocalizedRecipeTaxonomyTerm[];
  filters: RecipeFilters;
}

/**
 * Desktop keeps filters permanently visible in a sidebar — on a wide screen
 * there's room, and seeing the available axes is part of understanding the
 * catalogue. Mobile puts them behind a sheet with an active-count badge
 * instead of stacking the same sidebar above the results, which would push
 * every recipe below the fold.
 *
 * All filtering, searching, and paging is done by the backend; this renders
 * whatever came back, in the order it came back.
 */
export async function RecipesBrowser({ result, categories, foodGroups, filters }: RecipesBrowserProps) {
  const t = await getTranslations("recipes");

  const labels = {
    searchLabel: t("search.label"),
    searchPlaceholder: t("search.placeholder"),
    category: t("filters.category"),
    foodGroup: t("filters.foodGroup"),
    all: t("filters.all"),
    clear: t("filters.clear"),
  };

  const activeCount = countActiveFilters(filters);
  const totalPages = result.totalPages ?? 1;

  return (
    <Section>
      <Container>
        <header className="flex flex-col gap-3">
          <h1 className="text-display font-extrabold text-text-primary">{t("heading")}</h1>
          <p className="max-w-narrow text-body text-text-secondary">{t("intro")}</p>
        </header>

        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,16rem)_1fr] lg:gap-12">
          <aside className="hidden lg:block lg:sticky lg:top-28 lg:self-start">
            <RecipeFilterPanel filters={filters} categories={categories} foodGroups={foodGroups} labels={labels} />
          </aside>

          <div className="flex min-w-0 flex-col gap-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <RecipeFilterSheet
                filters={filters}
                categories={categories}
                foodGroups={foodGroups}
                labels={labels}
                activeCount={activeCount}
                openLabel={t("filters.open")}
                closeLabel={t("filters.close")}
                title={t("filters.title")}
              />
              {/* An honest count: "N of M" only while filtered, plain "M recipes" otherwise. */}
              <p aria-live="polite" className="text-body-sm text-text-secondary">
                {activeCount > 0
                  ? t("results.count", { count: result.data.length, total: result.total })
                  : t("results.countAll", { total: result.total })}
              </p>
            </div>

            {result.data.length === 0 ? (
              <EmptyResults filters={filters} activeCount={activeCount} />
            ) : (
              <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {result.data.map((recipe, index) => (
                  <li key={recipe._id} className="flex">
                    {/* Only the first row of the first page is eager (§13). */}
                    <RecipeCard recipe={recipe} priority={filters.page === 1 && index < 3} />
                  </li>
                ))}
              </ul>
            )}

            {totalPages > 1 && <Pagination filters={filters} totalPages={totalPages} />}
          </div>
        </div>
      </Container>
    </Section>
  );
}

/**
 * Three genuinely different situations, not one message: nothing published
 * at all is a content state the visitor can do nothing about; a search that
 * matched nothing suggests checking spelling; filters that matched nothing
 * suggest removing one. Collapsing them into "No results" would give the
 * wrong advice in two of the three cases.
 */
async function EmptyResults({ filters, activeCount }: { filters: RecipeFilters; activeCount: number }) {
  const t = await getTranslations("recipes");

  const { icon: Icon, message, hint } =
    activeCount === 0
      ? { icon: UtensilsCrossed, message: t("empty.noRecipes"), hint: null }
      : filters.search
        ? { icon: SearchX, message: t("empty.noSearchResults", { query: filters.search }), hint: t("empty.noSearchResultsHint") }
        : { icon: SearchX, message: t("empty.noResults"), hint: t("empty.noResultsHint") };

  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border-hairline border-border bg-surface-muted px-6 py-14 text-center">
      <Icon aria-hidden="true" className="size-icon-xl text-text-muted" />
      <p className="max-w-md break-words text-body-lg font-semibold text-text-primary">{message}</p>
      {hint && <p className="max-w-md text-body-sm text-text-secondary">{hint}</p>}
      {activeCount > 0 && (
        <Link href={AppRoute.Recipes} className="mt-2 text-body-sm font-semibold text-primary hover:underline">
          {t("filters.clear")}
        </Link>
      )}
    </div>
  );
}

/**
 * Real links, not buttons: a page is a distinct URL, so it should be
 * shareable, openable in a new tab, and reachable without JavaScript.
 */
async function Pagination({ filters, totalPages }: { filters: RecipeFilters; totalPages: number }) {
  const t = await getTranslations("recipes");
  const { page } = filters;

  const linkClass = "inline-flex h-control-sm items-center rounded-full border-hairline border-border bg-surface px-4 text-body-sm font-semibold text-text-primary hover:border-primary hover:text-primary";
  const disabledClass = "inline-flex h-control-sm items-center rounded-full border-hairline border-border px-4 text-body-sm font-semibold text-text-muted opacity-60";

  return (
    <nav aria-label={t("pagination.label")} className="flex items-center justify-between gap-4 pt-2">
      {page > 1 ? (
        <Link href={`${AppRoute.Recipes}${toSearchParamsString({ ...filters, page: page - 1 })}`} className={linkClass} rel="prev">
          {t("pagination.previous")}
        </Link>
      ) : (
        <span className={disabledClass} aria-disabled="true">
          {t("pagination.previous")}
        </span>
      )}

      <span className="text-body-sm text-text-secondary">{t("pagination.page", { page, total: totalPages })}</span>

      {page < totalPages ? (
        <Link href={`${AppRoute.Recipes}${toSearchParamsString({ ...filters, page: page + 1 })}`} className={linkClass} rel="next">
          {t("pagination.next")}
        </Link>
      ) : (
        <span className={disabledClass} aria-disabled="true">
          {t("pagination.next")}
        </span>
      )}
    </nav>
  );
}
