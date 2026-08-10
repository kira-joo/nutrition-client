import type { LocalizedDoctorProfile } from "@/lib/domain/doctor-profile";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Reveal, RevealGroup } from "@/components/ui/reveal";

export interface ProgramHighlightsSectionProps {
  doctorProfile: LocalizedDoctorProfile;
}

/**
 * A wide feature-row grid — the third distinct shape alongside
 * `TrustBandSection`'s borderless numbered list and `DoctorIntroSection`'s
 * media split (docs/design-system.md's anti-repetition rule). Each
 * highlight's real CMS text already carries its own leading checkmark
 * (authored content, not markup — verified against live data), so a block
 * here is plain text in a soft surface, not text plus a second redundant
 * icon layered on top.
 */
export function ProgramHighlightsSection({ doctorProfile }: ProgramHighlightsSectionProps) {
  const highlights = [...doctorProfile.programHighlights].sort((a, b) => a.order - b.order);
  if (highlights.length === 0) return null;

  const heading = doctorProfile.programHeading;

  return (
    <Section>
      <Container>
        {heading && (
          <Reveal>
            <h2 className="max-w-narrow text-heading-1 font-bold text-text-primary">{heading}</h2>
          </Reveal>
        )}
        <RevealGroup as="ul" className="mt-heading-gap grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {highlights.map((highlight, index) => (
            <li key={index} className="h-full rounded-xl bg-surface p-6 shadow-sm">
              <p className="text-body-lg text-text-primary">{highlight.text}</p>
            </li>
          ))}
        </RevealGroup>
      </Container>
    </Section>
  );
}
