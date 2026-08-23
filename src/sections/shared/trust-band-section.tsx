import type { LocalizedDoctorProfile } from "@/lib/domain/doctor-profile";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Reveal, RevealGroup } from "@/components/ui/reveal";
import { SURFACE_NOTCHED, SURFACE_HOVER_ELEVATION } from "@/components/ui/surface";
import { cn } from "@/lib/cn";

export interface TrustBandSectionProps {
  doctorProfile: LocalizedDoctorProfile;
}

/**
 * The homepage redesign's first distinct card family: a numbered card
 * grid, the numeral rendered oversized and mostly off-canvas as a
 * watermark rather than a small inline glyph. Still a numbered list in
 * substance (the CMS content genuinely is an ordered set of reasons) —
 * only the presentation moved from a bare border-and-text row to the
 * `SURFACE_NOTCHED` card shape, which is what makes this read as a
 * genuine card family rather than the plain list it replaces.
 *
 * Distinct from `ProgramHighlightsSection`'s connecting-timeline treatment
 * on purpose (docs/design-system.md's anti-repetition rule): both sections
 * are "why trust this program" content, so they need to look like two
 * different ideas, not two colour variants of one card.
 *
 * Hidden entirely if the CMS has no reasons authored yet, rather than
 * rendering an empty heading.
 */
export function TrustBandSection({ doctorProfile }: TrustBandSectionProps) {
  const reasons = [...doctorProfile.whyChooseReasons].sort((a, b) => a.order - b.order);
  if (reasons.length === 0) return null;

  const heading = doctorProfile.whyChooseHeading;

  return (
    <Section className="bg-surface-muted">
      <Container>
        {heading && (
          <Reveal>
            <h2 className="max-w-narrow text-heading-1 font-black text-text-primary">{heading}</h2>
          </Reveal>
        )}
        <RevealGroup as="ol" className="mt-heading-gap grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {reasons.map((reason, index) => (
            <li
              key={index}
              className={cn(
                "relative flex min-h-32 flex-col justify-end overflow-hidden p-6",
                SURFACE_NOTCHED,
                SURFACE_HOVER_ELEVATION
              )}
            >
              {/* Decorative watermark numeral — real content is the `<p>` below, so this is `aria-hidden` and never the accessible label for the list item. Clipped by the card's own `overflow-hidden`, which is also what keeps it from ever pushing layout — but only a little: `text-display` bottoms out at 40px on a small screen, and the original `-end-2 -top-6` offset was tuned against its ~72px desktop size, so at 40px that same fixed offset pushed most of the glyph out of frame instead of just its corner. */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -end-1 -top-2 text-display font-black leading-none text-primary/15"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <p className="relative text-body-lg font-medium text-text-primary">{reason.text}</p>
            </li>
          ))}
        </RevealGroup>
      </Container>
    </Section>
  );
}
