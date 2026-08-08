import { getTranslations } from "next-intl/server";
import { Clapperboard } from "lucide-react";
import AppRoute from "@/constant/AppRoute.enum";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";

/** Mirrors the recipe detail route's not-found: a missing video is its own product state, not a failed fetch to retry. */
export default async function VideoNotFound() {
  const t = await getTranslations("videos");

  return (
    <Section>
      <Container width="narrow" className="flex flex-col items-center gap-4 text-center">
        <Clapperboard aria-hidden="true" className="size-icon-xl text-text-muted" />
        <h1 className="text-heading-1 font-bold text-text-primary">{t("detail.notFound")}</h1>
        <Button href={AppRoute.Videos} variant="secondary" className="mt-2">
          {t("detail.back")}
        </Button>
      </Container>
    </Section>
  );
}
