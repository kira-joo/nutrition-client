import Image from "next/image";
import { ImageOff } from "lucide-react";
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
 */
export function RecipeCard({ recipe, priority = false }: RecipeCardProps) {
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

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="min-w-0 break-words text-body-lg font-semibold text-text-primary transition-colors duration-fast group-hover:text-primary">
          {recipe.title}
        </h3>
        {recipe.description && <p className="line-clamp-2 min-w-0 break-words text-body-sm text-text-secondary">{recipe.description}</p>}
      </div>
    </Link>
  );
}
