import { getTranslations } from "next-intl/server";
import { Megaphone } from "lucide-react";
import AppRoute from "@/constant/AppRoute.enum";
import { NotFoundLayout } from "@/components/ui/not-found-layout";

/**
 * A missing campaign is its own product state, not a server fault: the link may
 * have been shared after the campaign ended, or before it started — there's
 * nothing to retry, so this offers the way back to the homepage instead of a
 * retry action. The description earns its place here for that reason.
 */
export default async function CampaignNotFound() {
  const t = await getTranslations("campaigns");

  return (
    <NotFoundLayout
      icon={Megaphone}
      title={t("notFound.heading")}
      description={t("notFound.body")}
      action={{ href: AppRoute.Home, label: t("notFound.backHome") }}
    />
  );
}
