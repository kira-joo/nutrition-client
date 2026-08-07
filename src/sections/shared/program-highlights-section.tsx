import type { LocalizedDoctorProfile } from "@/lib/domain/doctor-profile";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";

export interface ProgramHighlightsSectionProps {
  doctorProfile: LocalizedDoctorProfile;
}

/**
 * A soft-paper panel (docs/design-system.md's first card family) holding
 * the highlight list — deliberately a different rhythm from the trust
 * band above it (borderless numbered list) so two consecutive sections
 * don't read as the same component reskinned.
 */
export function ProgramHighlightsSection({ doctorProfile }: ProgramHighlightsSectionProps) {
  const highlights = [...doctorProfile.programHighlights].sort((a, b) => a.order - b.order);
  if (highlights.length === 0) return null;

  const heading = doctorProfile.programHeading;

  return (
    <Section>
      <Container width="narrow">
        <Reveal className="rounded-xl border-hairline border-border bg-surface p-6 shadow-md sm:p-10">
          {heading && <h2 className="text-heading-1 font-bold text-text-primary">{heading}</h2>}
          <ul className="mt-6 flex flex-col gap-4">
            {highlights.map((highlight, index) => (
              <li key={index} className="text-body-lg text-text-secondary">
                {highlight.text}
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>
    </Section>
  );
}
