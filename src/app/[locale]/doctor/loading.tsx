import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Skeleton } from "@/components/ui/skeleton";
import { MediaTilesSkeleton, TextLinesSkeleton } from "@/components/ui/skeleton-blocks";

/** Mirrors the doctor page: circular portrait masthead, two-column bio spread, then the gallery. */
export default function DoctorLoading() {
  return (
    <>
      <section className="bg-hero pb-12 pt-12 lg:pb-16 lg:pt-16">
        <Container width="narrow" className="flex flex-col items-center">
          <Skeleton className="size-32 rounded-full lg:size-40" />
          <Skeleton className="mt-6 h-10 w-64" />
          <Skeleton className="mt-3 h-5 w-full max-w-sm" />
        </Container>
      </section>

      <Section>
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
            <TextLinesSkeleton lines={4} />
            <TextLinesSkeleton lines={3} />
          </div>
        </Container>
      </Section>

      <Section spacing="sm" className="border-y-hairline border-border bg-surface-muted">
        <Container>
          <Skeleton className="h-8 w-48" />
          <MediaTilesSkeleton count={3} className="mt-8 lg:grid lg:grid-cols-3" tileClassName="w-56 sm:w-64 lg:w-full" />
        </Container>
      </Section>
    </>
  );
}
