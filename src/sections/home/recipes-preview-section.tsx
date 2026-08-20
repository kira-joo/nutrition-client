import { getTranslations } from "next-intl/server";
import type { LocalizedRecipe } from "@/lib/domain/recipe";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { SectionHeader } from "@/components/ui/section-header";
import { RevealGroup } from "@/components/ui/reveal";
import { CONTENT_GRID_CLASSNAME } from "@/components/ui/content-grid";
import { RecipeCard } from "@/components/recipes/recipe-card";
import AppRoute from "@/constant/AppRoute.enum";
import { cn } from "@/lib/cn";

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
        <SectionHeader
          eyebrow={t("recipesPreview.label")}
          title={t("recipesPreview.heading")}
          description={t("recipesPreview.body")}
          actionLabel={t("recipesPreview.viewAll")}
          actionHref={AppRoute.Recipes}
        />

        <RevealGroup className={cn("mt-heading-gap", CONTENT_GRID_CLASSNAME)}>
          {featured.map((recipe) => (
            <RecipeCard key={recipe._id} recipe={recipe} />
          ))}
        </RevealGroup>
      </Container>
    </Section>
  );
}
