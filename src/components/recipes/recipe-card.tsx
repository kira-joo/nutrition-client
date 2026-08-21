import Image from "next/image";
import { Clock, ImageOff, Users as UsersIcon } from "lucide-react";
import type { LocalizedRecipe } from "@/lib/domain/recipe";
import { Link } from "@/i18n/navigation";
import { appHref } from "@/constant/AppRoute.enum";
import { MediaPill } from "@/components/ui/media-pill";
import { SURFACE_RAISED, SURFACE_HOVER_ELEVATION } from "@/components/ui/surface";
import { cn } from "@/lib/cn";

export interface RecipeCardProps {
  /**
   * Semantic depth only — the heading's visual size is the card's design and does
   * not move with it. `h3` is right under a section heading, as on the homepage
   * previews; a browse page whose own `h1` is the nearest heading above the grid
   * passes `h2`, because skipping a level makes the document outline claim a
   * nesting that isn't there.
   */
  headingLevel?: "h2" | "h3";
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
 *
 * The metadata row is real recipe fields only: `prepTime`/`cookTime`/
 * `servings` are optional free-text bilingual strings on the real Recipe
 * model (not numbers), rendered only when authored. Critically, the row
 * *container* is never conditional on whether any of the three exist —
 * only its contents are. A recipe with zero authored metadata still gets
 * the same reserved one-line-tall footer, just empty, via its own
 * `min-height`. Making the whole row `{metadata.length > 0 && ...}` was
 * the actual cause of cards ending up visibly different heights: within
 * a single grid row, `align-items: stretch` equalizes cards against each
 * other, but a *different* row further down — where none of that row's
 * cards happen to have any metadata — has nothing forcing it to match an
 * earlier row's height, so the grid as a whole reads as uneven.
 */
export function RecipeCard({ headingLevel: Heading = "h3", recipe, priority = false }: RecipeCardProps) {
  return (
    <Link
      href={appHref.recipe(recipe._id)}
      className={cn("group flex h-full flex-col overflow-hidden", SURFACE_RAISED, SURFACE_HOVER_ELEVATION)}
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

        {recipe.category?.title && <MediaPill position="bottom-start">{recipe.category.title}</MediaPill>}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5">
        <Heading
          className="min-w-0 break-words text-body-lg font-semibold text-text-primary transition-colors duration-fast group-hover:text-primary"
          style={{ minHeight: "calc(var(--leading-body-lg) * 2em)" }}
        >
          {recipe.title}
        </Heading>
        <p
          className="line-clamp-2 min-w-0 break-words text-body-sm text-text-secondary"
          style={{ minHeight: "calc(var(--leading-body-sm) * 2em)" }}
        >
          {recipe.description}
        </p>

        {/* Always rendered — see the component doc comment on why this can't be conditional on `metadata.length`. */}
        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-3 text-caption text-text-muted" style={{ minHeight: "calc(var(--leading-caption) * 1em)" }}>
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
      </div>
    </Link>
  );
}
