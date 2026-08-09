import { getTranslations } from "next-intl/server";
import type { LocalizedFaqSectionWithItems } from "@/lib/domain/faq";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { SectionHeader } from "@/components/ui/section-header";
import { Reveal } from "@/components/ui/reveal";
import { Accordion } from "@/components/ui/accordion";
import AppRoute from "@/constant/AppRoute.enum";

export interface FaqPreviewSectionProps {
  faqSections: LocalizedFaqSectionWithItems[];
}

const PREVIEW_ITEM_COUNT = 4;

export async function FaqPreviewSection({ faqSections }: FaqPreviewSectionProps) {
  const items = faqSections.flatMap((section) => section.items).slice(0, PREVIEW_ITEM_COUNT);
  if (items.length === 0) return null;
  const t = await getTranslations("home");

  return (
    <Section className="bg-surface-muted">
      <Container width="narrow">
        <SectionHeader title={t("faq.heading")} actionLabel={t("faq.viewAll")} actionHref={AppRoute.Faq} />

        <Reveal className="mt-heading-gap rounded-xl bg-surface px-6 shadow-sm sm:px-8">
          <Accordion items={items.map((item) => ({ id: item._id, question: item.question, answer: item.answer }))} />
        </Reveal>
      </Container>
    </Section>
  );
}
