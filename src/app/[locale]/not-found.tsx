import { getTranslations } from "next-intl/server";
import { Compass } from "lucide-react";
import AppRoute from "@/constant/AppRoute.enum";
import { NotFoundLayout } from "@/components/ui/not-found-layout";

/**
 * The locale-level 404 boundary: the fallback for a `notFound()` raised inside
 * `[locale]` by a route without its own `not-found.tsx`.
 *
 * **It is not the site's unmatched-URL page, despite the obvious reading.** Two
 * measured facts, both worth knowing before relying on this file:
 *
 *   - There is no `src/app/not-found.tsx`, so a genuinely unmatched URL renders
 *     Next's own built-in 404 instead of anything in this app — verified by
 *     finding `next-error-h1` in the markup for `/ar/this-route-does-not-exist`.
 *   - The invalid-locale path this used to claim (`layout.tsx` calling
 *     `notFound()` for a locale outside `routing.locales`) does not reach here
 *     either, because the middleware redirects an unknown locale first —
 *     `/zz` measured as a 307.
 *
 * So this currently has no reachable trigger of its own; the four nested
 * boundaries (books, videos, recipes, campaigns) handle every `notFound()` the
 * app actually raises. It stays as the correct boundary for the next route added
 * under `[locale]` without its own, but do not mistake it for site-wide cover.
 */
export default async function NotFound() {
  const t = await getTranslations("layout");

  return (
    <NotFoundLayout
      icon={Compass}
      title={t("notFound.heading")}
      description={t("notFound.body")}
      action={{ href: AppRoute.Home, label: t("notFound.backHome") }}
    />
  );
}
