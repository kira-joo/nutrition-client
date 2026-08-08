import type { LocalizedResult, ImageAsset, LocalizedString } from "@kira-joo/toolkit-common";
import type { RecipeTaxonomyTerm } from "@/lib/domain/recipe-taxonomy";

/**
 * Mirrors `GET /api/public/recipes` (list, paginated) and
 * `GET /api/public/recipes/[id]` (detail) — both populate `category`/
 * `foodGroups` as full objects, not bare ids.
 */
export interface Recipe {
  _id: string;
  title: LocalizedString;
  description: LocalizedString;
  image: ImageAsset;
  category: RecipeTaxonomyTerm;
  foodGroups: RecipeTaxonomyTerm[];
  ingredients: LocalizedString[];
  instructions: LocalizedString[];
  prepTime?: LocalizedString;
  cookTime?: LocalizedString;
  servings?: LocalizedString;
}

export interface RecipesListParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  /**
   * Forwarded to the backend, which filters server-side. This used to be a
   * documented gap worked around by post-filtering an already-fetched page
   * (which under-filled pages, since it could only ever narrow the current
   * page of results); nutrition-staff has since added the query param, so
   * the workaround is gone and pagination is correct again.
   */
  foodGroups?: string;
}

/**
 * The shape this app actually renders: the raw contract above with every
 * bilingual field resolved to a plain string. Derived from the raw type
 * rather than hand-written, so the two can't drift.
 */
export type LocalizedRecipe = LocalizedResult<Recipe>;
