import { getFaqItemsEndpoint, getFaqSectionsEndpoint } from "../../../api/faq.endpoints";
import { fetchPublic } from "@/lib/api/fetch-public";
import { CacheTag } from "@/lib/cache/cache-tags";
import { groupFaqItemsBySection, type FaqSectionWithItems } from "@/lib/domain/faq";

/**
 * Returns FAQ sections with their items already grouped and sorted by the
 * CMS-authored `order` field. This is the one place `order` is used as a
 * sort key in this data layer: unlike a listing endpoint's default
 * ordering (which this app never re-sorts — see getPackages), FAQ
 * sections/items are flattened by the backend into two separate
 * unordered-by-intent arrays, and `order` is the only signal identifying
 * the sequence staff actually authored (confirmed against the live
 * backend: /api/public/faq-sections returned "Section 2" before "Section
 * 1" — the raw response order does not reflect intended display order).
 * Grouping itself is also required client-side work, since the backend
 * never nests items under sections.
 */
export async function getFaqSectionsWithItems(): Promise<FaqSectionWithItems[]> {
  const [sections, items] = await Promise.all([
    fetchPublic(getFaqSectionsEndpoint, { tags: [CacheTag.FAQ_SECTIONS] }),
    fetchPublic(getFaqItemsEndpoint, { tags: [CacheTag.FAQ_ITEMS] }),
  ]);

  return groupFaqItemsBySection(sections, items);
}
