import { MethodType, type Endpoint } from "@kira-joo/frontend-toolkit-core/server";
import { PublicApiRoute } from "./public-api-route";
import type { RecipeTaxonomyTerm } from "../src/lib/domain/recipe-taxonomy";

export const getRecipeCategoriesEndpoint: Endpoint<{ returnType: RecipeTaxonomyTerm[] }> = {
  url: PublicApiRoute.RECIPE_CATEGORIES,
  methodType: MethodType.GET,
};

export const getRecipeFoodGroupsEndpoint: Endpoint<{ returnType: RecipeTaxonomyTerm[] }> = {
  url: PublicApiRoute.RECIPE_FOOD_GROUPS,
  methodType: MethodType.GET,
};
