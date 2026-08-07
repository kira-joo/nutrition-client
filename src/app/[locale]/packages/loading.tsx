import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Skeleton } from "@/components/ui/skeleton";
import { CardGridSkeleton, PageHeadingSkeleton } from "@/components/ui/skeleton-blocks";

/** Mirrors PackagesPricingSection: heading and duration control on one row, two package cards below. */
export default function PackagesLoading() {
  return (
    <Section>
      <Container>
        <div className="grid gap-8 lg:grid-cols-2 lg:items-end">
          <PageHeadingSkeleton withLabel />
          <Skeleton className="h-12 w-full rounded-full lg:w-72 lg:justify-self-end" />
          <CardGridSkeleton count={2} lines={5} withAction className="lg:col-span-2" />
        </div>
      </Container>
    </Section>
  );
}
