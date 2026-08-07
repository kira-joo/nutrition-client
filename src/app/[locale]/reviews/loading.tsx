import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { CardGridSkeleton, PageHeadingSkeleton } from "@/components/ui/skeleton-blocks";

/** Mirrors ReviewsGrid: heading/intro over a grid of card-shaped placeholders. */
export default function ReviewsLoading() {
  return (
    <Section>
      <Container>
        <PageHeadingSkeleton withIntro />
        <CardGridSkeleton className="mt-10 sm:grid-cols-2 lg:grid-cols-3" count={6} lines={3} />
      </Container>
    </Section>
  );
}
