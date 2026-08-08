import { getTranslations } from "next-intl/server";
import type { LocalizedRecipe } from "@/lib/domain/recipe";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { RecipeCard } from "@/components/recipes/recipe-card";
import AppRoute from "@/constant/AppRoute.enum";

export interface RecipesPreviewSectionProps {
  recipes: LocalizedRecipe[];
}

const PREVIEW_COUNT = 3;

/**
 * Replaces the old horizontal recipe rail (formerly half of
 * `DiscoverySection`) with exactly three full-scale `RecipeCard`s, centered
 * in the standard container — the same card used on the listing page, so
 * "featured on the homepage" and "browsing the full list" never look like
 * two different products. No horizontal scroll at any width: the grid
 * reflows 1 → 2 → 3 columns instead.
 */
export async function RecipesPreviewSection({ recipes }: RecipesPreviewSectionProps) {
  if (recipes.length === 0) return null;
  const t = await getTranslations("home");
  const featured = recipes.slice(0, PREVIEW_COUNT);

  return (
    <Section className="bg-primary-soft">
      <Container>
        <Reveal className="flex flex-col items-start gap-2">
          <p className="text-label font-semibold uppercase tracking-wide text-accent">{t("recipesPreview.label")}</p>
          <h2 className="text-heading-1 font-bold text-text-primary">{t("recipesPreview.heading")}</h2>
          <p className="max-w-narrow text-body text-text-secondary">{t("recipesPreview.body")}</p>
        </Reveal>

        <div className="mt-heading-gap grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {featured.map((recipe, index) => (
            <Reveal key={recipe._id} delay={index * 0.08}>
              <RecipeCard recipe={recipe} />
            </Reveal>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Button href={AppRoute.Recipes} variant="ghost">
            {t("recipesPreview.viewAll")}
          </Button>
        </div>
      </Container>
    </Section>
  );
}
