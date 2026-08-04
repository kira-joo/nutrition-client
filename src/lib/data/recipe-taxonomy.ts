import { getRecipeCategoriesEndpoint, getRecipeFoodGroupsEndpoint } from "../../../api/recipe-taxonomy.endpoints";
import { fetchPublic } from "@/lib/api/fetch-public";
import { CacheTag } from "@/lib/cache/cache-tags";
import type { RecipeTaxonomyTerm } from "@/lib/domain/recipe-taxonomy";

export async function getRecipeCategories(): Promise<RecipeTaxonomyTerm[]> {
  return fetchPublic(getRecipeCategoriesEndpoint, { tags: [CacheTag.RECIPE_CATEGORIES] });
}

export async function getRecipeFoodGroups(): Promise<RecipeTaxonomyTerm[]> {
  return fetchPublic(getRecipeFoodGroupsEndpoint, { tags: [CacheTag.RECIPE_FOOD_GROUPS] });
}
