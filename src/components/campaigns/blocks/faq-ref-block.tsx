import { Container } from "@/components/ui/container";
import { Accordion } from "@/components/ui/accordion";
import type { LocalizedFaqRefBlock } from "@/lib/domain/campaign";
import type { LocalizedFaqSectionWithItems } from "@/lib/domain/faq";

export interface FaqRefBlockProps {
  block: LocalizedFaqRefBlock;
  /** Already fetched by the page (only when at least one block needs it) — resolving a reference is never a second network round trip. */
  faqSections: LocalizedFaqSectionWithItems[];
}

/**
 * Reuses the exact `/faq` accordion component rather than a bespoke
 * campaign FAQ list, so the interaction a visitor already knows from the
 * main FAQ page behaves identically here.
 *
 * `faqSectionId` referencing a section that doesn't exist (deleted after
 * the campaign was authored, or a copy/paste id mistake) is a content
 * authoring error, not a user-facing state worth its own message — it
 * fails safely by rendering nothing, the same posture the block renderer
 * takes for a genuinely unknown block type.
 */
export function FaqRefBlock({ block, faqSections }: FaqRefBlockProps) {
  const section = faqSections.find((candidate) => candidate._id === block.faqSectionId);

  if (!section || section.items.length === 0) {
    if (process.env.NODE_ENV === "development") {
      console.error(`[campaign] faqRef block references missing/empty FAQ section "${block.faqSectionId}"`);
    }
    return null;
  }

  return (
    <Container width="narrow">
      <h2 className="text-heading-1 font-bold text-text-primary">{block.heading ?? section.title}</h2>
      <Accordion
        className="mt-6"
        headingLevel={3}
        items={section.items.map((item) => ({ id: item._id, question: item.question, answer: item.answer }))}
      />
    </Container>
  );
}
