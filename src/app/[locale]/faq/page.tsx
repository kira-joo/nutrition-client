import type { Locale } from "@/constant/Locale.enum";
import { getFaqSectionsWithItems } from "@/lib/data";
import { FaqSections } from "@/sections/faq/faq-sections";
import { ClosingCtaSection } from "@/sections/shared/closing-cta-section";

interface FaqPageProps {
  params: { locale: Locale };
}

/**
 * A single-source page: without the FAQ there is no page, so a fetch
 * failure belongs in `error.tsx` rather than rendering an empty scaffold.
 * An empty-but-successful response is a different case and is handled as a
 * real empty state inside FaqSections.
 */
export default async function FaqPage({ params }: FaqPageProps) {
  const faqSections = await getFaqSectionsWithItems(params.locale);

  return (
    <>
      <FaqSections faqSections={faqSections} />
      <ClosingCtaSection />
    </>
  );
}
