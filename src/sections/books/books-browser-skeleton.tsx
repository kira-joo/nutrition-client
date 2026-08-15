import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeadingSkeleton } from "@/components/ui/skeleton-blocks";

/** Mirrors `BooksBrowser`'s real layout and the `aspect-[5/7]` cover ratio `BookCard` uses — a CLS requirement, matching `VideosGallerySkeleton`'s own rationale. */
export function BooksBrowserSkeleton() {
  return (
    <div dir="rtl">
      <Section>
        <Container>
          <PageHeadingSkeleton withIntro />
          <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 lg:gap-8">
            {Array.from({ length: 8 }, (_, index) => (
              <div key={index} className="flex flex-col gap-2">
                <Skeleton className="aspect-[5/7] w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </Container>
      </Section>
    </div>
  );
}
