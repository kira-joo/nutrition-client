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
    <Section className="relative overflow-hidden bg-cta text-white">
      {/* One deliberate one-off gradient (globals.css's documented
          exception for a component-specific value with no repeating
          pattern to tokenize) rather than a second decorative asset — the
          homepage already spends its one botanical flourish on the
          package card's leaf mark and the footer directly below this
          band; repeating that motif here would dilute both. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_50%_0%,rgba(255,255,255,0.12),transparent)]"
      />
      <Container width="narrow" className="relative text-center">
        <Reveal className="flex flex-col items-center gap-4">
          <h2 className="text-heading-1 font-black">{t("closingCta.heading")}</h2>
          <p className="max-w-md text-body-lg text-white/85">{t("closingCta.body")}</p>
          {/*
            The inverted treatment this band needs: a white pill on the gradient.
            Its hover cue is the lift and shadow rather than a colour shift —
            white-to-90%-white on a white pill is a change nobody can see, and
            the depth gesture is the one the rest of the app already uses for
            "this responds". The bare `hover:bg-white/90` it replaces also
            latched after a tap, leaving the CTA looking pressed for the rest of
            the visit.

            Sized past the shared `lg` tier (52px/15px text, the biggest
            `Button` offers) with a scoped override rather than a new size
            variant: this is the single highest-stakes CTA on the page, the
            last thing before the footer, and no other Button call site in
            the app needs a fourth tier — a real, one-off exception, not a
            pattern to generalize into the shared component.

            `!h-16`, not `h-16`: this app's `cn()` only teaches
            tailwind-merge its custom `fontSize` scale (see `cn.ts`), not
            its custom `height` scale, so `h-control-lg` (from `size="lg"`)
            isn't recognized as the same utility group as a plain `h-16`
            — both survive the merge and the CSS cascade's source order
            picked `h-control-lg`, silently keeping the button at 52px
            despite the override. The `!` forces it regardless of source
            order; `px-10`/`text-body-lg` didn't need it because `px-8` and
            `text-button` ARE in tailwind-merge's default groups.
          */}
          <Button
            href={AppRoute.Consultation}
            variant="secondary"
            size="lg"
            className="mt-2 !h-16 border-white bg-white px-10 text-body-lg font-bold text-primary shadow-md pointer:hover:shadow-raised pointer:hover:-translate-y-0.5"
          >
            {t("closingCta.cta")}
          </Button>
        </Reveal>
      </Container>
    </Section>
  );
}
