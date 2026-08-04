import type { PaginatedResponse } from "@kira-joo/toolkit-common";
import { getRecipeEndpoint, listRecipesEndpoint } from "../../../api/recipes.endpoints";
import { fetchPublic } from "@/lib/api/fetch-public";
import { CacheTag } from "@/lib/cache/cache-tags";
import type { Recipe, RecipesListParams } from "@/lib/domain/recipe";
import { nullableOnNotFound } from "@kira-joo/frontend-toolkit-core/server";

export async function getRecipes(params: RecipesListParams = {}): Promise<PaginatedResponse<Recipe>> {
  const { foodGroup, ...query } = params;

  const result = await fetchPublic(listRecipesEndpoint, { query, tags: [CacheTag.RECIPES] });

  // No `foodGroups` query param exists server-side yet (a confirmed
  // backend gap, not an oversight) — post-filter the already-fetched page.
  // This can under-fill a page after filtering; see docs/architecture.md.
  // Filtering here doesn't reorder anything the backend returned.
  if (!foodGroup) return result;

  const filtered = result.data.filter((recipe) => recipe.foodGroups.some((group) => group._id === foodGroup));
  return { ...result, data: filtered, total: filtered.length };
}

/** Returns `null` on a genuine 404 rather than throwing, so the calling page decides whether to call notFound() — a data function shouldn't make that navigation decision itself. */
export async function getRecipe(id: string): Promise<Recipe | null> {
  return nullableOnNotFound(() =>
    fetchPublic(getRecipeEndpoint, {
      params: { id },
      tags: [CacheTag.RECIPES, CacheTag.recipe(id)],
    })
  );
}
