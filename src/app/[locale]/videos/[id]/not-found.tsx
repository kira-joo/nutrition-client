import { getTranslations } from "next-intl/server";
import { Clapperboard } from "lucide-react";
import AppRoute from "@/constant/AppRoute.enum";
import { NotFoundLayout } from "@/components/ui/not-found-layout";

/** Mirrors the recipe detail route's not-found: a missing video is its own product state, not a failed fetch to retry, so this returns to the video catalogue rather than offering a retry. */
export default async function VideoNotFound() {
  const t = await getTranslations("videos");

  return (
    <NotFoundLayout
      icon={Clapperboard}
      title={t("detail.notFound")}
      action={{ href: AppRoute.Videos, label: t("detail.back") }}
    />
  );
}
