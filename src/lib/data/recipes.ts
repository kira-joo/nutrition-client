import { localize, type LocalizedLocale, type PaginatedResponse } from "@kira-joo/toolkit-common";
import { nullableOnNotFound } from "@kira-joo/frontend-toolkit-core/server";
import { getRecipeEndpoint, listRecipesEndpoint } from "../../../api/recipes.endpoints";
import { fetchPublic } from "@/lib/api/fetch-public";
import { CacheTag } from "@/lib/cache/cache-tags";
import type { LocalizedRecipe, Recipe, RecipesListParams } from "@/lib/domain/recipe";

/**
 * Localization happens here, once, immediately after the fetch — never in
 * sections or components. Caching stays locale-independent on purpose: the
 * cached entry is the raw bilingual payload keyed by URL, so both locales
 * share one cache entry and one revalidation, and `localize` runs per
 * request on the already-cached data.
 */
export async function getRecipes(locale: LocalizedLocale, params: RecipesListParams = {}): Promise<PaginatedResponse<LocalizedRecipe>> {
  const { foodGroup, ...query } = params;

  const raw: PaginatedResponse<Recipe> = await fetchPublic(listRecipesEndpoint, { query, tags: [CacheTag.RECIPES] });
  const result = localize(raw, locale);

  // No `foodGroups` query param exists server-side yet (a confirmed
  // backend gap, not an oversight) — post-filter the already-fetched page.
  // This can under-fill a page after filtering; see docs/architecture.md.
  // Filtering here doesn't reorder anything the backend returned, and it
  // matches on `_id`, which localization leaves untouched.
  if (!foodGroup) return result;

  const filtered = result.data.filter((recipe) => recipe.foodGroups.some((group) => group._id === foodGroup));
  return { ...result, data: filtered, total: filtered.length };
}

/** Returns `null` on a genuine 404 rather than throwing, so the calling page decides whether to call notFound() — a data function shouldn't make that navigation decision itself. */
export async function getRecipe(id: string, locale: LocalizedLocale): Promise<LocalizedRecipe | null> {
  const raw = await nullableOnNotFound<Recipe>(() =>
    fetchPublic(getRecipeEndpoint, {
      params: { id },
      tags: [CacheTag.RECIPES, CacheTag.recipe(id)],
    })
  );
  return raw && localize(raw, locale);
}
