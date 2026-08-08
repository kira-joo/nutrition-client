import Image from "next/image";
import { Clock, ImageOff, Users as UsersIcon } from "lucide-react";
import type { LocalizedRecipe } from "@/lib/domain/recipe";
import { Link } from "@/i18n/navigation";
import { appHref } from "@/constant/AppRoute.enum";

export interface RecipeCardProps {
  recipe: LocalizedRecipe;
  /** Only the first row of the first page should be eager; everything else stays lazy (§13). */
  priority?: boolean;
}

/**
 * Image-forward card at a fixed 4:3 ratio with the category as an overlay
 * chip, per docs/design-system.md. The ratio is fixed rather than derived
 * from each image so the grid can't shift as images load — a CLS
 * requirement, not a polish detail (§13/§18).
 *
 * The whole card is one link rather than a card with a nested "read more"
 * link: one tab stop per recipe, and the entire target is clickable.
 *
 * Title and description each reserve a fixed two-line height (via
 * `min-height: calc(var(--leading-*) * 2em)`, built from the existing
 * line-height tokens rather than a guessed pixel value) so a one-line
 * title and a three-line title produce identical card footprints — a
 * `line-clamp` alone only caps the maximum, it doesn't reserve a minimum.
 * The metadata row is real recipe fields only: `prepTime`/`cookTime`/
 * `servings` are optional free-text bilingual strings on the real Recipe
 * model (not numbers), rendered only when authored — there is no
 * calories/difficulty/rating field to show instead.
 */
export function RecipeCard({ recipe, priority = false }: RecipeCardProps) {
  const metadata = [recipe.prepTime, recipe.cookTime, recipe.servings].filter(Boolean) as string[];

  return (
    <Link
      href={appHref.recipe(recipe._id)}
      className="group flex h-full flex-col overflow-hidden rounded-xl border-hairline border-border bg-surface shadow-sm transition-shadow duration-base ease-standard hover:shadow-md"
    >
      <div className="relative aspect-[4/3] bg-surface-muted">
        {recipe.image?.secureUrl ? (
          <Image
            src={recipe.image.secureUrl}
            alt={recipe.title}
            fill
            sizes="(min-width: 1280px) 22rem, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
            className="object-cover"
            priority={priority}
            placeholder={recipe.image.placeholderUrl ? "blur" : undefined}
            blurDataURL={recipe.image.placeholderUrl}
          />
        ) : (
          /* A designed placeholder rather than a broken-image icon (§13). */
          <span aria-hidden="true" className="flex h-full items-center justify-center text-text-muted">
            <ImageOff className="size-icon-lg" />
          </span>
        )}

        {recipe.category?.title && (
          <span className="absolute bottom-2 start-2 rounded-full bg-surface/90 px-2.5 py-1 text-caption font-semibold text-text-primary backdrop-blur">
            {recipe.category.title}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3
          className="min-w-0 break-words text-body-lg font-semibold text-text-primary transition-colors duration-fast group-hover:text-primary"
          style={{ minHeight: "calc(var(--leading-body-lg) * 2em)" }}
        >
          {recipe.title}
        </h3>
        {recipe.description && (
          <p
            className="line-clamp-2 min-w-0 break-words text-body-sm text-text-secondary"
            style={{ minHeight: "calc(var(--leading-body-sm) * 2em)" }}
          >
            {recipe.description}
          </p>
        )}

        {metadata.length > 0 && (
          <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-3 text-caption text-text-muted">
            {recipe.prepTime && (
              <span className="flex items-center gap-1.5">
                <Clock className="size-icon-sm" aria-hidden="true" />
                {recipe.prepTime}
              </span>
            )}
            {recipe.cookTime && (
              <span className="flex items-center gap-1.5">
                <Clock className="size-icon-sm" aria-hidden="true" />
                {recipe.cookTime}
              </span>
            )}
            {recipe.servings && (
              <span className="flex items-center gap-1.5">
                <UsersIcon className="size-icon-sm" aria-hidden="true" />
                {recipe.servings}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
