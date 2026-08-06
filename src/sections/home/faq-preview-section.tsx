import { getTranslations } from "next-intl/server";
import { resolveLocalized } from "@kira-joo/toolkit-common";
import type { FaqSectionWithItems } from "@/lib/domain/faq";
import type { Locale } from "@/constant/Locale.enum";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { Accordion } from "@/components/ui/accordion";

export interface FaqPreviewSectionProps {
  faqSections: FaqSectionWithItems[];
  locale: Locale;
}

const PREVIEW_ITEM_COUNT = 4;

export async function FaqPreviewSection({ faqSections, locale }: FaqPreviewSectionProps) {
  const items = faqSections.flatMap((section) => section.items).slice(0, PREVIEW_ITEM_COUNT);
  if (items.length === 0) return null;
  const t = await getTranslations("home");

  return (
    <Section spacing="sm" className="bg-surface-muted">
      <Container width="narrow">
        <Reveal>
          <h2 className="text-heading-1 font-bold text-text-primary">{t("faq.heading")}</h2>
        </Reveal>

        <Reveal className="mt-8 rounded-xl bg-surface px-6 shadow-sm sm:px-8">
          <Accordion items={items.map((item) => ({ id: item._id, question: resolveLocalized(item.question, locale), answer: resolveLocalized(item.answer, locale) }))} />
        </Reveal>

        <div className="mt-8 text-center">
          <Button href="/faq" variant="ghost">
            {t("faq.viewAll")}
          </Button>
        </div>
      </Container>
    </Section>
  );
}
