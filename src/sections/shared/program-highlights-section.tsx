import type { LocalizedDoctorProfile } from "@/lib/domain/doctor-profile";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Reveal, RevealGroup } from "@/components/ui/reveal";

export interface ProgramHighlightsSectionProps {
  doctorProfile: LocalizedDoctorProfile;
}

/**
 * Every authored highlight currently starts with a literal "✅ " — real
 * CMS content, not markup, so it can't be removed at the source without a
 * content edit. Stripped only when it's exactly that leading glyph
 * (checked, not assumed) because the numbered node below now carries the
 * same "this is a confirmed benefit" meaning visually; keeping both reads
 * as the emoji-bullet list this redesign replaces. Any highlight authored
 * without that exact prefix renders untouched.
 */
const LEADING_CHECKMARK = /^✅\s*/;
const stripLeadingCheckmark = (text: string) => text.replace(LEADING_CHECKMARK, "");

/**
 * A connecting vine/timeline — the third distinct shape alongside
 * `TrustBandSection`'s numbered card grid and `DoctorPreviewSection`'s
 * media split (docs/design-system.md's anti-repetition rule: both this
 * section and `TrustBandSection` are "why trust this program" content, so
 * they need to look like two different ideas). A single connecting line
 * runs through every highlight — horizontal on desktop, vertical on
 * mobile — which is the one place in the homepage the "Botanical Trust"
 * identity shows up as literal structure rather than colour: the line is
 * the stem, each highlight is a node on it.
 *
 * The line is two real elements (`border-inline-start` on mobile,
 * `border-top` on desktop — swapped by breakpoint, not a background image),
 * clipped between the first and last node by `inset-x`/`inset-y` insets sized
 * to half a node, so it never overshoots past the first/last dot. Each
 * highlight's real CMS text already carries its own leading checkmark
 * (authored content, not markup — verified against live data), so the node
 * is a plain dot, not a second redundant icon repeating what the text says.
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
            <h2 className="max-w-narrow text-heading-1 font-black text-text-primary">{heading}</h2>
          </Reveal>
        )}
        <RevealGroup as="ul" className="relative mt-heading-gap flex flex-col gap-8 sm:flex-row sm:gap-6">
          {/* The vine itself: a hairline that runs through every node's
              centre. `top-5`/`start-5` matches half the 2.5rem (`size-10`)
              node size set below, so the line always meets each dot at its
              centre regardless of how many nodes there are. `start`/`end`
              stay logical throughout — mixing them with a physical
              `inset-x`/`inset-y` shorthand here previously collapsed the
              line to zero width, because the two kinds of property don't
              compose predictably when they target the same physical side. */}
          <div
            aria-hidden="true"
            className="absolute start-5 top-5 bottom-5 w-px bg-primary/20 sm:bottom-auto sm:end-5 sm:h-px sm:w-auto"
          />
          {highlights.map((highlight, index) => (
            <li key={index} className="relative flex gap-4 sm:flex-1 sm:flex-col sm:gap-4">
              <span
                aria-hidden="true"
                className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-background text-body-sm font-bold text-primary"
              >
                {index + 1}
              </span>
              <p className="pt-2 text-body-lg text-text-primary sm:pt-0">{stripLeadingCheckmark(highlight.text)}</p>
            </li>
          ))}
        </RevealGroup>
      </Container>
    </Section>
  );
}
