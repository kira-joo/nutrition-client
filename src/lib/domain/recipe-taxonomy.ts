import type { LocalizedResult, LocalizedString } from "@kira-joo/toolkit-common";

/** Mirrors `GET /api/public/recipe-categories` and `/recipe-food-groups` — both plain arrays, unpaginated, identical shape. */
export interface RecipeTaxonomyTerm {
  _id: string;
  title: LocalizedString;
}

/**
 * The shape this app actually renders: the raw contract above with every
 * bilingual field resolved to a plain string. Derived from the raw type
 * rather than hand-written, so the two can't drift.
 */
export type LocalizedRecipeTaxonomyTerm = LocalizedResult<RecipeTaxonomyTerm>;
