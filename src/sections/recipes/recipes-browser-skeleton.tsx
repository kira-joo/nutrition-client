import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Skeleton } from "@/components/ui/skeleton";
import { CardGridSkeleton, PageHeadingSkeleton, TextLinesSkeleton } from "@/components/ui/skeleton-blocks";

/** Mirrors RecipesBrowser: heading, filter sidebar, card grid — at the sizes the loaded content uses. */
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
            <CardGridSkeleton count={6} lines={2} className="sm:grid-cols-2 xl:grid-cols-3" />
          </div>
        </div>
      </Container>
    </Section>
  );
}
