import type { PublicEndpoint } from "../src/lib/api/public-endpoint.type";
import type { RecipeTaxonomyTerm } from "../src/lib/domain/recipe-taxonomy";

export const getRecipeCategoriesEndpoint: PublicEndpoint<{ returnType: RecipeTaxonomyTerm[] }> = {
  url: "/api/public/recipe-categories",
};

export const getRecipeFoodGroupsEndpoint: PublicEndpoint<{ returnType: RecipeTaxonomyTerm[] }> = {
  url: "/api/public/recipe-food-groups",
};
