import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Skeleton } from "@/components/ui/skeleton";
import { CardGridSkeleton, PageHeadingSkeleton } from "@/components/ui/skeleton-blocks";

/** Mirrors PackagesPricingSection: heading and duration control on one row, then the card grid at the board's own breakpoints and gap. */
export default function PackagesLoading() {
  return (
    <Section>
      <Container>
        <div className="grid gap-8 lg:grid-cols-2 lg:items-end">
          <PageHeadingSkeleton withLabel />
          <Skeleton className="h-12 w-full rounded-full lg:w-72 lg:justify-self-end" />
          {/*
            Mirrors the real board rather than the generic default: it uses
            `gap-8`, not the shared `gap-6`, and goes to three columns at `lg`
            once three or more packages are published — which is the case, so a
            two-column 24px-gap placeholder would have re-flowed into a
            three-column 32px-gap grid the moment content arrived. Three cards
            because that is what fills the widest row; the real count is data the
            skeleton cannot know.
          */}
          <CardGridSkeleton count={3} lines={5} withAction className="gap-8 lg:col-span-2 lg:grid-cols-3" />
        </div>
      </Container>
    </Section>
  );
}
