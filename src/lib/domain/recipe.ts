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
   * Client-side only — the public list endpoint has no `foodGroups` query
   * param despite the field being filterable server-side (a confirmed
   * backend gap, not an oversight here). Filtering by food group means
   * post-filtering an already-fetched page, which can under-fill a page
   * after filtering; see docs/architecture.md for the fast-follow this
   * warrants.
   */
  foodGroup?: string;
}

/**
 * The shape this app actually renders: the raw contract above with every
 * bilingual field resolved to a plain string. Derived from the raw type
 * rather than hand-written, so the two can't drift.
 */
export type LocalizedRecipe = LocalizedResult<Recipe>;
