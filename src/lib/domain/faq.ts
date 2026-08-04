import type { LocalizedString } from "@kira-joo/toolkit-common";

/** Mirrors `GET /api/public/faq-sections` — a plain array, unpaginated. */
export interface FaqSection {
  _id: string;
  title: LocalizedString;
  order: number;
}

/**
 * Mirrors `GET /api/public/faq-items` — a plain array, unpaginated, FLAT
 * (not grouped by section server-side; `section` is populated as a full
 * object). Grouping by section is presentation-layer work for a later
 * phase — see groupFaqItemsBySection below, which the data layer exposes
 * now so that grouping logic lives in exactly one place.
 */
export interface FaqItem {
  _id: string;
  section: FaqSection;
  question: LocalizedString;
  answer: LocalizedString;
  order: number;
}

export interface FaqSectionWithItems extends FaqSection {
  items: FaqItem[];
}

/** Groups the flat item list by section and sorts both levels by `order` — the one place this logic lives, per the plan's "no duplicated locale-fallback/mapping logic" standard. */
export function groupFaqItemsBySection(sections: FaqSection[], items: FaqItem[]): FaqSectionWithItems[] {
  return [...sections]
    .sort((a, b) => a.order - b.order)
    .map((section) => ({
      ...section,
      items: items.filter((item) => item.section._id === section._id).sort((a, b) => a.order - b.order),
    }));
}
