import { resolveLocalized } from "@kira-joo/toolkit-common";
import type { DoctorProfile } from "@/lib/domain/doctor-profile";
import type { Locale } from "@/constant/Locale.enum";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";

export interface TrustBandSectionProps {
  doctorProfile: DoctorProfile;
  locale: Locale;
}

/**
 * Borderless editorial treatment (docs/design-system.md's third card
 * family) — a numbered list with a connecting accent rule, not a row of
 * identical icon cards. Hidden entirely if the CMS has no reasons
 * authored yet, rather than rendering an empty heading.
 */
export function TrustBandSection({ doctorProfile, locale }: TrustBandSectionProps) {
  const reasons = [...doctorProfile.whyChooseReasons].sort((a, b) => a.order - b.order);
  if (reasons.length === 0) return null;

  const heading = resolveLocalized(doctorProfile.whyChooseHeading, locale);

  return (
    <Section spacing="sm" className="border-y-hairline border-border bg-surface-muted">
      <Container>
        {heading && (
          <Reveal>
            <h2 className="max-w-narrow text-heading-1 font-bold text-text-primary">{heading}</h2>
          </Reveal>
        )}
        <ol className="mt-8 grid gap-x-10 gap-y-6 sm:grid-cols-2">
          {reasons.map((reason, index) => (
            <li key={index}>
              <Reveal delay={index * 0.06} className="flex items-start gap-4 border-s-[3px] border-primary ps-4">
                <span aria-hidden="true" className="text-heading-3 font-bold text-primary/40">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="text-body-lg text-text-primary">{resolveLocalized(reason.text, locale)}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  );
}
