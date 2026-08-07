import { getTranslations } from "next-intl/server";
import { Megaphone } from "lucide-react";
import AppRoute from "@/constant/AppRoute.enum";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";

/**
 * A missing campaign is its own product state, not a server fault: the
 * link may have been shared after the campaign ended, or before it started
 * — there's nothing to retry, so this offers the way back to the homepage
 * instead of a retry action.
 */
export default async function CampaignNotFound() {
  const t = await getTranslations("campaigns");

  return (
    <Section>
      <Container width="narrow" className="flex flex-col items-center gap-4 py-16 text-center">
        <Megaphone aria-hidden="true" className="size-icon-xl text-text-muted" />
        <h1 className="text-heading-1 font-bold text-text-primary">{t("notFound.heading")}</h1>
        <p className="text-body text-text-secondary">{t("notFound.body")}</p>
        <Button href={AppRoute.Home} variant="secondary" className="mt-2">
          {t("notFound.backHome")}
        </Button>
      </Container>
    </Section>
  );
}
