import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeadingSkeleton } from "@/components/ui/skeleton-blocks";

/**
 * Mirrors VideosGallery's real layout at the sizes the loaded content uses
 * (a CLS requirement, not polish): the same responsive column counts and
 * the same 9:16 tile ratio every real video asset actually has.
 */
export function VideosGallerySkeleton() {
  return (
    <Section>
      <Container>
        <PageHeadingSkeleton withIntro />
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 lg:gap-6 xl:grid-cols-5">
          {Array.from({ length: 10 }, (_, index) => (
            <div key={index} className="flex flex-col gap-2">
              <Skeleton className="aspect-[9/16] w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
