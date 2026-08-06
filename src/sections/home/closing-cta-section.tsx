import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";

export async function ClosingCtaSection() {
  const t = await getTranslations("home");

  return (
    <Section className="bg-cta text-white">
      <Container width="narrow" className="text-center">
        <Reveal className="flex flex-col items-center gap-4">
          <h2 className="text-heading-1 font-bold">{t("closingCta.heading")}</h2>
          <p className="max-w-md text-body-lg text-white/85">{t("closingCta.body")}</p>
          <Button href="/consultation" variant="secondary" size="lg" className="mt-2 border-white bg-white text-primary hover:bg-white/90">
            {t("closingCta.cta")}
          </Button>
        </Reveal>
      </Container>
    </Section>
  );
}
