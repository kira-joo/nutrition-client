import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Mirrors the real page's shape — circular portrait, name, tagline, two
 * bio blocks, then a gallery strip — at the same sizes the loaded content
 * uses, so swapping in real data doesn't shift the layout.
 */
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
        <Container width="narrow" className="flex flex-col gap-10">
          {[0, 1].map((index) => (
            <div key={index} className="flex flex-col gap-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </Container>
      </Section>

      <Section spacing="sm" className="border-y-hairline border-border bg-surface-muted">
        <Container>
          <Skeleton className="h-8 w-48" />
          <div className="mt-8 flex gap-4 overflow-hidden lg:grid lg:grid-cols-3">
            {[0, 1, 2].map((index) => (
              <Skeleton key={index} className="aspect-[4/3] w-56 shrink-0 sm:w-64 lg:w-full" />
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
