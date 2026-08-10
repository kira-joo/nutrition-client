import { getTranslations } from "next-intl/server";
import { Compass } from "lucide-react";
import AppRoute from "@/constant/AppRoute.enum";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";

/**
 * The site-wide 404 — for a genuinely unmatched URL, or an invalid locale
 * segment (`src/app/[locale]/layout.tsx` calls `notFound()` for anything
 * outside `routing.locales`). Distinct from `/recipes/[id]`'s and
 * `/campaigns/[slug]`'s own `not-found.tsx` files, which exist because
 * those two have a more specific, content-aware message worth showing;
 * this is the generic fallback every other route (and any URL that
 * matches no route at all) falls back to.
 */
export default async function NotFound() {
  const t = await getTranslations("layout");

  return (
    <Section>
      <Container width="narrow" className="flex flex-col items-center gap-4 py-16 text-center">
        <Compass aria-hidden="true" className="size-icon-xl text-text-muted" />
        <h1 className="text-heading-1 font-bold text-text-primary">{t("notFound.heading")}</h1>
        <p className="text-body text-text-secondary">{t("notFound.body")}</p>
        <Button href={AppRoute.Home} variant="secondary" className="mt-2">
          {t("notFound.backHome")}
        </Button>
      </Container>
    </Section>
  );
}
