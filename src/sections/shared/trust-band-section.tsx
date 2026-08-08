import type { LocalizedDoctorProfile } from "@/lib/domain/doctor-profile";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Reveal, RevealGroup } from "@/components/ui/reveal";

export interface TrustBandSectionProps {
  doctorProfile: LocalizedDoctorProfile;
}

/**
 * Borderless editorial treatment (docs/design-system.md's third card
 * family) — a numbered list with a connecting accent rule, not a row of
 * identical icon cards. Hidden entirely if the CMS has no reasons
 * authored yet, rather than rendering an empty heading.
 */
export function TrustBandSection({ doctorProfile }: TrustBandSectionProps) {
  const reasons = [...doctorProfile.whyChooseReasons].sort((a, b) => a.order - b.order);
  if (reasons.length === 0) return null;

  const heading = doctorProfile.whyChooseHeading;

  return (
    <Section spacing="sm" className="border-y-hairline border-border bg-surface-muted">
      <Container>
        {heading && (
          <Reveal>
            <h2 className="max-w-narrow text-heading-1 font-bold text-text-primary">{heading}</h2>
          </Reveal>
        )}
        <RevealGroup as="ol" className="mt-8 grid gap-x-10 gap-y-6 sm:grid-cols-2">
          {reasons.map((reason, index) => (
            <li key={index} className="flex items-start gap-4 border-s-[3px] border-primary ps-4">
              <span aria-hidden="true" className="text-heading-3 font-bold text-primary/40">
                {String(index + 1).padStart(2, "0")}
              </span>
              <p className="text-body-lg text-text-primary">{reason.text}</p>
            </li>
          ))}
        </RevealGroup>
      </Container>
    </Section>
  );
}
