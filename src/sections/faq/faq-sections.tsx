import { getTranslations } from "next-intl/server";
import type { LocalizedFaqSectionWithItems } from "@/lib/domain/faq";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Accordion } from "@/components/ui/accordion";

export interface FaqSectionsProps {
  faqSections: LocalizedFaqSectionWithItems[];
}

/** Anchor target for the desktop jump links; derived from the section's own id so it's stable across renders. */
const sectionAnchor = (id: string) => `faq-section-${id}`;

/**
 * Desktop is a two-column layout: the page heading and a sticky list of
 * jump links on one side, the sections themselves on the other. That's a
 * real affordance rather than decoration — it scales as the FAQ grows, and
 * it's a different composition from /packages (heading + control on one
 * row) and /doctor (asymmetric bio spread), per the anti-repetition rule.
 * Below `lg` the nav is dropped entirely rather than stacked: on a phone
 * it would just be a second list of the same headings directly above them.
 *
 * Ordering is exactly what the backend composed — nutrition-staff joins
 * items to sections and sorts both by their authored `order` server-side
 * (see its `getPublicFaq()`), so there is nothing to group or sort here.
 *
 * Text arrives already resolved from the data layer; this renders it.
 */
export async function FaqSections({ faqSections }: FaqSectionsProps) {
  const t = await getTranslations("faq");

  // A section whose items are all unpublished comes back with an empty
  // `items` array — rendering its heading over nothing would look broken,
  // so it's dropped. If that leaves nothing at all, the page shows its
  // empty state instead of an empty scaffold.
  const sections = faqSections.filter((section) => section.items.length > 0);

  if (sections.length === 0) {
    return (
      <Section>
        <Container width="narrow" className="flex flex-col items-start gap-3">
          <h1 className="text-display font-extrabold text-text-primary">{t("heading")}</h1>
          <p className="text-body-lg text-text-secondary">{t("empty")}</p>
        </Container>
      </Section>
    );
  }

  return (
    <Section>
      <Container>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,18rem)_1fr] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <h1 className="text-display font-extrabold text-text-primary">{t("heading")}</h1>
            <p className="mt-3 text-body text-text-secondary">{t("intro")}</p>

            {/* Only worth showing when there's more than one place to jump to. */}
            {sections.length > 1 && (
              <nav aria-label={t("sectionsNavLabel")} className="mt-8 hidden lg:block">
                <ul className="flex flex-col gap-1 border-s-hairline border-border">
                  {sections.map((section) => (
                    <li key={section._id}>
                      <a
                        href={`#${sectionAnchor(section._id)}`}
                        className="-ms-px block border-s-2 border-transparent py-1.5 ps-4 text-body-sm text-text-secondary transition-colors duration-fast hover:border-primary hover:text-primary"
                      >
                        {section.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            )}
          </div>

          <div className="flex flex-col gap-12">
            {sections.map((section) => (
              // `scroll-mt-*` clears the fixed site header, which would
              // otherwise cover the heading a jump link lands on.
              <section key={section._id} id={sectionAnchor(section._id)} aria-labelledby={`${sectionAnchor(section._id)}-title`} className="scroll-mt-24 lg:scroll-mt-28">
                <h2 id={`${sectionAnchor(section._id)}-title`} className="text-heading-2 font-bold text-text-primary">
                  {section.title}
                </h2>
                <Accordion
                  className="mt-4"
                  allowMultiple
                  headingLevel={3}
                  items={section.items.map((item) => ({ id: item._id, question: item.question, answer: item.answer }))}
                />
              </section>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
