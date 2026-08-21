import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import AppRoute from "@/constant/AppRoute.enum";

/**
 * The site-wide closing band, shared by every long page rather than
 * re-authored per route. Reads from the `layout` namespace, not a
 * page-specific one — a component in `sections/shared` must not depend on
 * whichever page happens to render it.
 */
export async function ClosingCtaSection() {
  const t = await getTranslations("layout");

  return (
    <Section className="bg-cta text-white">
      <Container width="narrow" className="text-center">
        <Reveal className="flex flex-col items-center gap-4">
          <h2 className="text-heading-1 font-bold">{t("closingCta.heading")}</h2>
          <p className="max-w-md text-body-lg text-white/85">{t("closingCta.body")}</p>
          {/*
            The inverted treatment this band needs: a white pill on the gradient.
            Its hover cue is the lift and shadow rather than a colour shift —
            white-to-90%-white on a white pill is a change nobody can see, and
            the depth gesture is the one the rest of the app already uses for
            "this responds". The bare `hover:bg-white/90` it replaces also
            latched after a tap, leaving the CTA looking pressed for the rest of
            the visit.
          */}
          <Button href={AppRoute.Consultation} variant="secondary" size="lg" className="mt-2 border-white bg-white text-primary shadow-md pointer:hover:shadow-raised pointer:hover:-translate-y-0.5">
            {t("closingCta.cta")}
          </Button>
        </Reveal>
      </Container>
    </Section>
  );
}
