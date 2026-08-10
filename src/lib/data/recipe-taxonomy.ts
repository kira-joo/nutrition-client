import { localize, type LocalizedLocale } from "@kira-joo/toolkit-common";
import { getRecipeCategoriesEndpoint, getRecipeFoodGroupsEndpoint } from "../../../api/recipe-taxonomy.endpoints";
import { fetchPublic } from "@/lib/api/fetch-public";
import { CacheTag } from "@/lib/cache/cache-tags";
import type { LocalizedRecipeTaxonomyTerm, RecipeTaxonomyTerm } from "@/lib/domain/recipe-taxonomy";

/**
 * Localization happens here, once, immediately after the fetch — never in
 * sections or components. Caching stays locale-independent on purpose: the
 * cached entry is the raw bilingual payload keyed by URL, so both locales
 * share one cache entry and one revalidation, and `localize` runs per
 * request on the already-cached data.
 */
export async function getRecipeCategories(locale: LocalizedLocale): Promise<LocalizedRecipeTaxonomyTerm[]> {
  const raw: RecipeTaxonomyTerm[] = await fetchPublic(getRecipeCategoriesEndpoint, { tags: [CacheTag.RECIPE_CATEGORIES] });
  return localize(raw, locale);
}

export async function getRecipeFoodGroups(locale: LocalizedLocale): Promise<LocalizedRecipeTaxonomyTerm[]> {
  const raw: RecipeTaxonomyTerm[] = await fetchPublic(getRecipeFoodGroupsEndpoint, { tags: [CacheTag.RECIPE_FOOD_GROUPS] });
  return localize(raw, locale);
}
