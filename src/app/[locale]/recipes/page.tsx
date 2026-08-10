import { Suspense } from "react";
import type { Locale } from "@/constant/Locale.enum";
import { getRecipeCategories, getRecipeFoodGroups, getRecipes } from "@/lib/data";
import { parseRecipeFilters, toListParams, type RecipeFilters } from "@/lib/recipes/recipe-search-params";
import { RecipesBrowser } from "@/sections/recipes/recipes-browser";
import { RecipesBrowserSkeleton } from "@/sections/recipes/recipes-browser-skeleton";

interface RecipesPageProps {
  params: { locale: Locale };
  searchParams: Record<string, string | string[] | undefined>;
}

/**
 * The skeleton comes from a `Suspense` boundary here rather than a
 * `loading.tsx`, deliberately. A segment's `loading.tsx` also covers its
 * child routes, which made `/recipes/[id]` stream — and once the shell has
 * been flushed, `notFound()` can no longer set a status, so a missing
 * recipe returned HTTP 200 with not-found content. Measured both ways:
 * with the loading file, 200; without it, 404. Keeping the boundary inside
 * this page fixes the status and is better here anyway, because keying it
 * on the filters replays the skeleton on every filter change instead of
 * only the first load.
 */
export default function RecipesPage({ params, searchParams }: RecipesPageProps) {
  const filters = parseRecipeFilters(searchParams);

  return (
    <Suspense key={JSON.stringify(filters)} fallback={<RecipesBrowserSkeleton />}>
      <RecipesResults locale={params.locale} filters={filters} />
    </Suspense>
  );
}

/**
 * The three requests run together: the taxonomies don't depend on the
 * recipe query, so awaiting them in sequence would add a round trip for
 * nothing. Filtering, searching and paging are all done by the backend —
 * the full catalogue is never fetched to be narrowed in the browser.
 */
async function RecipesResults({ locale, filters }: { locale: Locale; filters: RecipeFilters }) {
  const [result, categories, foodGroups] = await Promise.all([
    getRecipes(locale, toListParams(filters)),
    getRecipeCategories(locale),
    getRecipeFoodGroups(locale),
  ]);

  return <RecipesBrowser result={result} categories={categories} foodGroups={foodGroups} filters={filters} />;
}
