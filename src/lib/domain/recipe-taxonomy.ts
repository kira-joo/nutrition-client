import type { LocalizedString } from "@kira-joo/toolkit-common";

/** Mirrors `GET /api/public/recipe-categories` and `/recipe-food-groups` — both plain arrays, unpaginated, identical shape. */
export interface RecipeTaxonomyTerm {
  _id: string;
  title: LocalizedString;
}
