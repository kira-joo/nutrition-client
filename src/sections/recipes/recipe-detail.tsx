import { getTranslations } from "next-intl/server";
import { ArrowLeft, Clock, CookingPot, Users } from "lucide-react";
import type { LocalizedRecipe } from "@/lib/domain/recipe";
import AppRoute from "@/constant/AppRoute.enum";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Link } from "@/i18n/navigation";
import { RecipeHeroImage } from "@/components/recipes/recipe-hero-image";
import { IngredientChecklist } from "@/components/recipes/ingredient-checklist";

export interface RecipeDetailProps {
  recipe: LocalizedRecipe;
}

/**
 * An editorial recipe read, not an admin record: photo and context on one
 * side, the things you actually use while cooking — ingredients, then
 * numbered steps — on the other, at a comfortable measure. On desktop the
 * media column sticks so the photo and timings stay visible while scrolling
 * through the method, which is the whole reason for the split.
 *
 * Every field is rendered only when the CMS actually has it. `prepTime`,
 * `cookTime` and `servings` are optional on the model, so the meta row can
 * legitimately be empty and simply doesn't render — nothing here invents a
 * missing time, yield, or nutrition figure.
 */
export async function RecipeDetail({ recipe }: RecipeDetailProps) {
  const t = await getTranslations("recipes");

  const meta = [
    { icon: Clock, label: t("detail.prepTime"), value: recipe.prepTime },
    { icon: CookingPot, label: t("detail.cookTime"), value: recipe.cookTime },
    { icon: Users, label: t("detail.servings"), value: recipe.servings },
  ].filter((entry) => entry.value);

  return (
    <Section>
      <Container>
        <Link
          href={AppRoute.Recipes}
          className="inline-flex items-center gap-2 text-body-sm font-semibold text-text-secondary transition-colors duration-fast hover:text-primary"
        >
          {/* Directional icon: mirrored under RTL, unlike the content icons above. */}
          <ArrowLeft className="size-icon-sm rtl:-scale-x-100" aria-hidden="true" />
          {t("detail.backToRecipes")}
        </Link>

        <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,28rem)_1fr] lg:gap-16">
          <div className="flex flex-col gap-6 lg:sticky lg:top-28 lg:self-start">
            {recipe.image?.secureUrl && (
              <RecipeHeroImage
                src={recipe.image.secureUrl}
                alt={recipe.title}
                width={recipe.image.width}
                height={recipe.image.height}
                placeholderUrl={recipe.image.placeholderUrl}
                viewLabel={t("detail.viewImage")}
              />
            )}

            {meta.length > 0 && (
              <dl className="grid grid-cols-2 gap-4 rounded-xl border-hairline border-border bg-surface p-5 sm:grid-cols-3">
                {meta.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex flex-col gap-1">
                    <dt className="flex items-center gap-1.5 text-caption font-semibold uppercase tracking-wide text-text-muted">
                      <Icon className="size-icon-sm" aria-hidden="true" />
                      {label}
                    </dt>
                    <dd className="min-w-0 break-words text-body-sm font-semibold text-text-primary">{value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>

          <div className="flex min-w-0 flex-col gap-10">
            <header className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-2">
                {recipe.category?.title && (
                  <span className="rounded-full bg-primary-soft px-3 py-1 text-caption font-semibold text-primary">{recipe.category.title}</span>
                )}
                {recipe.foodGroups?.map((group) => (
                  <span key={group._id} className="rounded-full border-hairline border-border px-3 py-1 text-caption font-medium text-text-secondary">
                    {group.title}
                  </span>
                ))}
              </div>

              <h1 className="min-w-0 break-words text-display font-extrabold text-text-primary">{recipe.title}</h1>
              {recipe.description && <p className="max-w-narrow break-words text-body-lg text-text-secondary">{recipe.description}</p>}
            </header>

            {recipe.ingredients.length > 0 && (
              <section aria-labelledby="recipe-ingredients">
                <h2 id="recipe-ingredients" className="text-heading-2 font-bold text-text-primary">
                  {t("detail.ingredients")}
                </h2>
                <div className="mt-4 border-t-hairline border-border pt-2">
                  <IngredientChecklist ingredients={recipe.ingredients} label={t("detail.ingredients")} />
                </div>
              </section>
            )}

            {recipe.instructions.length > 0 && (
              <section aria-labelledby="recipe-instructions">
                <h2 id="recipe-instructions" className="text-heading-2 font-bold text-text-primary">
                  {t("detail.instructions")}
                </h2>
                {/* A real <ol>: the numbering is the content, so it belongs in the markup rather than in a decorative span. */}
                <ol className="mt-4 flex flex-col gap-5">
                  {recipe.instructions.map((step, index) => (
                    <li key={index} className="flex gap-4">
                      <span
                        aria-hidden="true"
                        className="flex size-icon-xl shrink-0 items-center justify-center rounded-full bg-primary text-body-sm font-bold text-white"
                      >
                        {index + 1}
                      </span>
                      <p className="min-w-0 break-words pt-1 text-body text-text-secondary">{step}</p>
                    </li>
                  ))}
                </ol>
              </section>
            )}
          </div>
        </div>
      </Container>
    </Section>
  );
}
