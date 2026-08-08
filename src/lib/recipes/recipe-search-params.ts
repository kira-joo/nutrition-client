import type { RecipesListParams } from "@/lib/domain/recipe";
import { parsePage } from "@/lib/pagination/parse-page";

/** How many recipes a listing page shows. Server-side, so pages are never under-filled by later filtering. */
export const RECIPES_PER_PAGE = 12;

export interface RecipeFilters {
  search: string;
  category: string;
  foodGroup: string;
  page: number;
}

/**
 * Filter state lives in the URL, not component state: the listing stays a
 * Server Component that queries the backend, and a filtered view is
 * shareable, linkable, and survives a refresh or a Back press. It also
 * means there is exactly one source of truth for "what is being shown".
 */
export function parseRecipeFilters(searchParams: Record<string, string | string[] | undefined>): RecipeFilters {
  const single = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value) ?? "";

  return {
    search: single(searchParams.search).trim(),
    category: single(searchParams.category),
    foodGroup: single(searchParams.foodGroup),
    page: parsePage(searchParams.page),
  };
}

/** Only filters the visitor actually set end up in the query string, so a default view has a clean URL. */
export function toSearchParamsString(filters: Partial<RecipeFilters>): string {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.category) params.set("category", filters.category);
  if (filters.foodGroup) params.set("foodGroup", filters.foodGroup);
  if (filters.page && filters.page > 1) params.set("page", String(filters.page));
  const query = params.toString();
  return query ? `?${query}` : "";
}

/**
 * Maps URL state onto `RecipesListParams`. `foodGroup` stays singular and is
 * NOT a backend query param: the public list endpoint has no food-group
 * filter (see `RecipesListParams.foodGroup`), so `getRecipes` strips this key
 * off and post-filters the fetched page itself. Emitting a plural
 * `foodGroups` here instead silently broke the filter entirely — the key fell
 * through to the backend as an unrecognized query param while `getRecipes`
 * saw `foodGroup === undefined` and skipped post-filtering. Object spreads
 * are exempt from excess-property checking, so the compiler could not catch
 * it; keep this key spelled exactly as the type declares it.
 */
export function toListParams(filters: RecipeFilters): RecipesListParams {
  return {
    page: filters.page,
    limit: RECIPES_PER_PAGE,
    ...(filters.search ? { search: filters.search } : {}),
    ...(filters.category ? { category: filters.category } : {}),
    ...(filters.foodGroup ? { foodGroup: filters.foodGroup } : {}),
  };
}

export function countActiveFilters(filters: RecipeFilters): number {
  return [filters.search, filters.category, filters.foodGroup].filter(Boolean).length;
}
