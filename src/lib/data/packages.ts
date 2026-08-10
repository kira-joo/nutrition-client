import { localize, type LocalizedLocale } from "@kira-joo/toolkit-common";
import { getPackagesEndpoint } from "../../../api/packages.endpoints";
import { fetchPublic } from "@/lib/api/fetch-public";
import { CacheTag } from "@/lib/cache/cache-tags";
import type { LocalizedPackage, Package } from "@/lib/domain/package";

/**
 * No pagination on this endpoint — a small, fixed-size collection by design.
 * Returned in whatever order nutrition-staff provides; the backend is the
 * source of truth for ordering, so this never re-sorts client-side.
 *

 * Localization happens here, once, immediately after the fetch — never in
 * sections or components. Caching stays locale-independent on purpose: the
 * cached entry is the raw bilingual payload keyed by URL, so both locales
 * share one cache entry and one revalidation, and `localize` runs per
 * request on the already-cached data.
 */
export async function getPackages(locale: LocalizedLocale): Promise<LocalizedPackage[]> {
  const raw: Package[] = await fetchPublic(getPackagesEndpoint, { tags: [CacheTag.PACKAGES] });
  return localize(raw, locale);
}
