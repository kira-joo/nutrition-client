import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeadingSkeleton } from "@/components/ui/skeleton-blocks";

/**
 * Mirrors VideosGallery's real layout at the sizes the loaded content uses
 * (a CLS requirement, not polish): the same responsive column counts and
 * the same 16:9 landscape card ratio the redesigned `VideoCard` uses.
 */
export function VideosGallerySkeleton() {
  return (
    <Section>
      <Container>
        <PageHeadingSkeleton withIntro />
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="flex flex-col gap-2">
              <Skeleton className="aspect-video w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
