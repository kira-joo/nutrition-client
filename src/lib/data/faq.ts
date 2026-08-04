import { getFaqEndpoint } from "../../../api/faq.endpoints";
import { fetchPublic } from "@/lib/api/fetch-public";
import { CacheTag } from "@/lib/cache/cache-tags";
import type { FaqSectionWithItems } from "@/lib/domain/faq";

/**
 * Sections with their items already joined, ordered, and published-
 * filtered — nutrition-staff does this server-side (see its
 * `getPublicFaq()`), so this app never repeats that merge/sort logic
 * itself. Previously two fetches (sections + flat items) plus a
 * client-side `groupFaqItemsBySection` — see docs/architecture.md
 * ("Public data flow") for why that shape was replaced.
 */
export async function getFaqSectionsWithItems(): Promise<FaqSectionWithItems[]> {
  return fetchPublic(getFaqEndpoint, { tags: [CacheTag.FAQ] });
}
