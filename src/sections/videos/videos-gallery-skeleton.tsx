import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Skeleton } from "@kira-joo/frontend-toolkit-tailwind/primitives";
import { PageHeadingSkeleton } from "@/components/ui/skeleton-blocks";
import { ContentGrid } from "@/components/ui/content-grid";

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
        <ContentGrid className="mt-10">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="flex flex-col gap-2">
              <Skeleton className="aspect-video w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </ContentGrid>
      </Container>
    </Section>
  );
}
