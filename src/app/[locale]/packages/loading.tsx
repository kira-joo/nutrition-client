import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Skeleton } from "@/components/ui/skeleton";

/** Mirrors the real layout: sticky heading column, duration control, then two package cards at the same sizes the loaded content uses. */
export default function PackagesLoading() {
  return (
    <Section>
      <Container>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,20rem)_1fr] lg:gap-16">
          <div className="flex flex-col gap-3">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-12 w-full max-w-sm" />
          </div>

          <div className="flex flex-col gap-8">
            <Skeleton className="h-12 w-full rounded-full lg:w-72" />
            <div className="grid gap-6 sm:grid-cols-2">
              {[0, 1].map((index) => (
                <div key={index} className="flex flex-col gap-4 rounded-xl border-hairline border-border bg-surface p-6 sm:p-8">
                  <Skeleton className="h-8 w-40" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-10 w-32" />
                  {[0, 1, 2, 3].map((row) => (
                    <Skeleton key={row} className="h-4 w-full" />
                  ))}
                  <Skeleton className="mt-4 h-11 w-full rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
