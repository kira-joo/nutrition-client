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
  // Every filter, `foodGroups` included, is now a real backend query param,
  // so paging and totals stay correct. Food group used to be post-filtered
  // here because the endpoint didn't support it; that workaround narrowed
  // only the current page, so a filtered page could come back under-filled
  // with a `total` that disagreed with the pager.
  const raw: PaginatedResponse<Recipe> = await fetchPublic(listRecipesEndpoint, { query: params, tags: [CacheTag.RECIPES] });
  return localize(raw, locale);
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
