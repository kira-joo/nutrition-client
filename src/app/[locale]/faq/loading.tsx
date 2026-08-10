import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { AccordionSkeleton, PageHeadingSkeleton } from "@/components/ui/skeleton-blocks";

/** Mirrors FaqSections: heading/nav column beside two groups of collapsed rows. */
export default function FaqLoading() {
  return (
    <Section>
      <Container>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,18rem)_1fr] lg:gap-16">
          <PageHeadingSkeleton withIntro />
          <div className="flex flex-col gap-12">
            <AccordionSkeleton rows={3} />
            <AccordionSkeleton rows={4} />
          </div>
        </div>
      </Container>
    </Section>
  );
}
