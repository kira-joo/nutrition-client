import { getTranslations } from "next-intl/server";
import { UtensilsCrossed } from "lucide-react";
import AppRoute from "@/constant/AppRoute.enum";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";

/**
 * A missing recipe is its own product state, distinct from a failed fetch:
 * there's nothing to retry, so this offers the way back to the catalogue
 * instead of a retry button.
 */
export default async function RecipeNotFound() {
  const t = await getTranslations("recipes");

  return (
    <Section>
      <Container width="narrow" className="flex flex-col items-center gap-4 text-center">
        <UtensilsCrossed aria-hidden="true" className="size-icon-xl text-text-muted" />
        <h1 className="text-heading-1 font-bold text-text-primary">{t("detail.notFound")}</h1>
        <Button href={AppRoute.Recipes} variant="secondary" className="mt-2">
          {t("detail.backToRecipes")}
        </Button>
      </Container>
    </Section>
  );
}
