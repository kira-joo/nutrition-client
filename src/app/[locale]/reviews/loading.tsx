import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeadingSkeleton, TextLinesSkeleton } from "@/components/ui/skeleton-blocks";

/**
 * Mirrors ReviewsGrid's real card shape — an image area over a short quote
 * and a name line — rather than the shared `CardGridSkeleton`, which is
 * shaped for `/packages`'s text-and-price cards (a heading, a price line,
 * feature lines) and has no image block at all. `ReviewCard`'s real height
 * genuinely varies (text-only, single image, or a before/after pair — see
 * that component's own doc comment), so this can't be pixel-exact for
 * every card the way a fixed-ratio grid can; it approximates the common,
 * image-plus-quote case, which is far closer than a card with no image at
 * all. The masonry columns aren't replicated here (they reflow around real
 * content anyway); a plain grid of the same card shape is enough to avoid
 * the large mismatch the generic primitive produced.
 */
export default function ReviewsLoading() {
  return (
    <Section>
      <Container>
        <PageHeadingSkeleton withIntro />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <ReviewCardSkeleton key={index} />
          ))}
        </div>
      </Container>
    </Section>
  );
}

/** Approximates `ReviewCard`'s image-plus-quote shape: a 4:3 image, a couple of quote lines, then a name line. */
function ReviewCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border-hairline border-border bg-surface">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="flex flex-col gap-3 p-5">
        <TextLinesSkeleton lines={2} />
        <Skeleton className="h-4 w-1/3" />
      </div>
    </div>
  );
}
