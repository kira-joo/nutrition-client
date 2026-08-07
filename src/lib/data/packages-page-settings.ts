import { localize, type LocalizedLocale } from "@kira-joo/toolkit-common";
import { getPackagesPageSettingsEndpoint } from "../../../api/packages-page-settings.endpoints";
import { fetchPublic } from "@/lib/api/fetch-public";
import { CacheTag } from "@/lib/cache/cache-tags";
import type { LocalizedPackagesPageSettings, PackagesPageSettings } from "@/lib/domain/packages-page-settings";

/**
 * Localization happens here, once, immediately after the fetch — never in
 * sections or components. Caching stays locale-independent on purpose: the
 * cached entry is the raw bilingual payload keyed by URL, so both locales
 * share one cache entry and one revalidation, and `localize` runs per
 * request on the already-cached data.
 */
export async function getPackagesPageSettings(locale: LocalizedLocale): Promise<LocalizedPackagesPageSettings> {
  const raw: PackagesPageSettings = await fetchPublic(getPackagesPageSettingsEndpoint, { tags: [CacheTag.PACKAGES_PAGE_SETTINGS] });
  return localize(raw, locale);
}
