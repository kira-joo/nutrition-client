import { getTranslations } from "next-intl/server";
import { Locale } from "@/constant/Locale.enum";

/**
 * 404 for an unknown lecture slug. Deliberately has no link back into the
 * site — this surface has no navigation by design — so it only explains.
 */
export default async function LectureNotFound() {
  const t = await getTranslations({ locale: Locale.AR, namespace: "lectures.notFound" });
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="flex max-w-md flex-col gap-2 text-center">
        <h1 className="text-heading-2 font-bold text-text-primary">{t("heading")}</h1>
        <p className="text-body text-text-secondary">{t("body")}</p>
      </div>
    </main>
  );
}
