import { localize, type LocalizedLocale } from "@kira-joo/toolkit-common";
import { getFaqEndpoint } from "../../../api/faq.endpoints";
import { fetchPublic } from "@/lib/api/fetch-public";
import { CacheTag } from "@/lib/cache/cache-tags";
import type { FaqSectionWithItems, LocalizedFaqSectionWithItems } from "@/lib/domain/faq";

/**
 * Sections with their items already joined, ordered, and published-
 * filtered — nutrition-staff does this server-side (see its
 * `getPublicFaq()`), so this app never repeats that merge/sort logic
 * itself. Previously two fetches (sections + flat items) plus a
 * client-side `groupFaqItemsBySection` — see docs/architecture.md
 * ("Public data flow") for why that shape was replaced.
 *

 * Localization happens here, once, immediately after the fetch — never in
 * sections or components. Caching stays locale-independent on purpose: the
 * cached entry is the raw bilingual payload keyed by URL, so both locales
 * share one cache entry and one revalidation, and `localize` runs per
 * request on the already-cached data.
 */
export async function getFaqSectionsWithItems(locale: LocalizedLocale): Promise<LocalizedFaqSectionWithItems[]> {
  const raw: FaqSectionWithItems[] = await fetchPublic(getFaqEndpoint, { tags: [CacheTag.FAQ] });
  return localize(raw, locale);
}
