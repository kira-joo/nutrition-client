import { getTranslations } from "next-intl/server";
import { UtensilsCrossed } from "lucide-react";
import AppRoute from "@/constant/AppRoute.enum";
import { NotFoundLayout } from "@/components/ui/not-found-layout";

/**
 * A missing recipe is its own product state, distinct from a failed fetch:
 * there's nothing to retry, so this offers the way back to the catalogue
 * instead of a retry button.
 */
export default async function RecipeNotFound() {
  const t = await getTranslations("recipes");

  return (
    <NotFoundLayout
      icon={UtensilsCrossed}
      title={t("detail.notFound")}
      action={{ href: AppRoute.Recipes, label: t("detail.backToRecipes") }}
    />
  );
}
