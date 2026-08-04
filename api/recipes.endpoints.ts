import type { PaginatedResponse } from "@kira-joo/toolkit-common";
import { MethodType, type Endpoint } from "@kira-joo/frontend-toolkit-core/server";
import { PublicApiRoute } from "./public-api-route";
import type { Recipe } from "../src/lib/domain/recipe";

export const listRecipesEndpoint: Endpoint<{
  query: { page?: number; limit?: number; search?: string; category?: string };
  returnType: PaginatedResponse<Recipe>;
}> = {
  url: PublicApiRoute.RECIPES,
  methodType: MethodType.GET,
};

export const getRecipeEndpoint: Endpoint<{ params: { id: string }; returnType: Recipe }> = {
  url: PublicApiRoute.RECIPE_DETAIL,
  methodType: MethodType.GET,
};
