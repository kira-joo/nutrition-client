import type { LocalizedDoctorProfile } from "@/lib/domain/doctor-profile";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";

export interface DoctorBioSectionProps {
  doctorProfile: LocalizedDoctorProfile;
}

/**
 * The bio as an asymmetric two-column editorial spread on desktop: the
 * lead block becomes a pull-quote in the wider column, the remaining
 * blocks stack in the narrower one. Below `lg` it collapses to a single
 * column in source order.
 *
 * The desktop treatment is a real second design pass, not the mobile
 * column centered in a wider viewport — §6 names that as a disallowed
 * desktop failure mode and asks specifically for pull-quote sidebars
 * here. Each column still lands inside a comfortable reading measure,
 * which a single centered `narrow` container would also have achieved but
 * only by leaving most of a 1440px viewport empty.
 *
 * Headings render only when authored. That isn't defensive padding: every
 * `bioSection` in the live CMS currently has an empty heading in both
 * locales, so an unconditional `<h2>` would emit empty headings into the
 * document outline on the real site today.
 */
export function DoctorBioSection({ doctorProfile }: DoctorBioSectionProps) {
  const sections = [...doctorProfile.bioSections]
    .sort((a, b) => a.order - b.order)
    .map((section) => ({ heading: section.heading ?? "", body: section.body }))
    .filter((section) => section.body);

  if (sections.length === 0) return null;

  const [lead, ...rest] = sections;

  return (
    <Section>
      <Container>
        <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
          <Reveal className="border-s-[3px] border-primary ps-6">
            {lead.heading && <h2 className="mb-3 text-heading-2 font-bold text-text-primary">{lead.heading}</h2>}
            <p className="text-body-lg font-medium text-text-primary">{lead.body}</p>
          </Reveal>

          {rest.length > 0 && (
            <div className="flex flex-col gap-8">
              {rest.map((section, index) => (
                <Reveal key={index} delay={(index + 1) * 0.06}>
                  {section.heading && <h2 className="mb-3 text-heading-2 font-bold text-text-primary">{section.heading}</h2>}
                  <p className="text-body text-text-secondary">{section.body}</p>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </Container>
    </Section>
  );
}
