import { localize, type LocalizedLocale } from "@kira-joo/toolkit-common";
import { getSiteSettingsEndpoint } from "../../../api/site-settings.endpoints";
import { fetchPublic } from "@/lib/api/fetch-public";
import { CacheTag } from "@/lib/cache/cache-tags";
import type { LocalizedSiteSettings, SiteSettings } from "@/lib/domain/site-settings";

/**
 * Localization happens here, once, immediately after the fetch — never in
 * sections or components. Caching stays locale-independent on purpose: the
 * cached entry is the raw bilingual payload keyed by URL, so both locales
 * share one cache entry and one revalidation, and `localize` runs per
 * request on the already-cached data.
 */
export async function getSiteSettings(locale: LocalizedLocale): Promise<LocalizedSiteSettings> {
  const raw: SiteSettings = await fetchPublic(getSiteSettingsEndpoint, { tags: [CacheTag.SITE_SETTINGS] });
  return localize(raw, locale);
}
