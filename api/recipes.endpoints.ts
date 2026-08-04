import type { PaginatedResponse } from "@kira-joo/toolkit-common";
import type { PublicEndpoint } from "../src/lib/api/public-endpoint.type";
import type { Recipe } from "../src/lib/domain/recipe";

export const listRecipesEndpoint: PublicEndpoint<{
  query: { page?: number; limit?: number; search?: string; category?: string };
  returnType: PaginatedResponse<Recipe>;
}> = {
  url: "/api/public/recipes",
};

/** `:id` placeholder — see public-endpoint.type.ts / build-url.ts for why this is `:id`, not `[id]`. */
export const getRecipeEndpoint: PublicEndpoint<{ params: { id: string }; returnType: Recipe }> = {
  url: "/api/public/recipes/:id",
};
