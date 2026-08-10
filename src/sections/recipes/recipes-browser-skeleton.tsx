import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeadingSkeleton, TextLinesSkeleton } from "@/components/ui/skeleton-blocks";

/**
 * Mirrors RecipesBrowser: heading, filter sidebar, card grid — at the sizes
 * the loaded content uses. The grid deliberately doesn't reuse the shared
 * `CardGridSkeleton`/`CardSkeleton` primitives: those are shaped for a
 * text-and-price card (see `/packages`, their actual native use — a
 * heading, a price line, feature lines, a CTA), which has neither the
 * shape nor the height of `RecipeCard`'s image-forward layout (a 4:3 image
 * over a short title/description). Reusing them here rendered a skeleton
 * roughly half the real card's height with no image block at all — a CLS
 * regression, not a shortcut. This composes the same `Skeleton` atom
 * directly into `RecipeCard`'s actual shape instead.
 */
export function RecipesBrowserSkeleton() {
  return (
    <Section>
      <Container>
        <PageHeadingSkeleton withIntro />
        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,16rem)_1fr] lg:gap-12">
          <div className="hidden flex-col gap-8 lg:flex">
            <Skeleton className="h-11 w-full rounded-full" />
            <TextLinesSkeleton lines={3} />
            <TextLinesSkeleton lines={5} />
          </div>
          <div className="flex flex-col gap-6">
            <Skeleton className="h-11 w-40 rounded-full" />
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }, (_, index) => (
                <RecipeCardSkeleton key={index} />
              ))}
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

/** Same structure as `RecipeCard`: a fixed 4:3 image area, then a title line and a two-line description. */
function RecipeCardSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border-hairline border-border bg-surface">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <Skeleton className="h-6 w-3/4" />
        <TextLinesSkeleton lines={2} />
      </div>
    </div>
  );
}
