import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Skeleton } from "@kira-joo/frontend-toolkit-tailwind/primitives";
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
 * all.
 *
 * The masonry columns ARE replicated, having previously not been: this used a
 * plain grid while the real page is a `columns-*` wall, so the whole layout
 * re-flowed from equal-height rows into masonry the moment content arrived.
 * Matching the container's layout mode removes that avoidable reflow. It cannot
 * make the swap pixel-perfect — real card heights vary, which is the point of a
 * masonry wall — but the structural jump is gone.
 */
export default function ReviewsLoading() {
  return (
    <Section>
      <Container>
        <PageHeadingSkeleton withIntro />
        {/*
          `columns-*`, deliberately not `grid-cols-*`, because that is what the
          real page uses — reviews are a masonry wall of variable-height cards
          (see `reviews-grid.tsx`). This skeleton previously used an equal-height
          grid, so the whole wall re-flowed the moment real content replaced it:
          a layout jump caused by the placeholder disagreeing with the thing it
          was standing in for. Matching the real layout is the point of a
          skeleton, and here it is also what removes the shift.
        */}
        <div className="mt-10 columns-1 gap-6 sm:columns-2 lg:columns-3">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="mb-6 break-inside-avoid">
              <ReviewCardSkeleton />
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}

/** Approximates `ReviewCard`'s image-plus-quote shape: a 4:3 image, a couple of quote lines, then a name line. `surface-notched`, matching the real card's shape post-unification — a plain `rounded-xl` skeleton would itself be a small shape-shift the instant real content replaces it. */
function ReviewCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden surface-notched border-hairline border-border bg-surface">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="flex flex-col gap-3 p-5">
        <TextLinesSkeleton lines={2} />
        <Skeleton className="h-4 w-1/3" />
      </div>
    </div>
  );
}
