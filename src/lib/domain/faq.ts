import type { LocalizedResult, LocalizedString } from "@kira-joo/toolkit-common";

/** Mirrors `GET /api/public/faq` — sections with their items already joined, ordered, and published-filtered server-side. No `order`/`status`/`createdAt`/`updatedAt`: nutrition-staff returns only what the public site renders, already in the order it should render — grouping/sorting is backend business logic, not frontend presentation logic. */
export interface FaqItem {
  _id: string;
  question: LocalizedString;
  answer: LocalizedString;
}

export interface FaqSectionWithItems {
  _id: string;
  title: LocalizedString;
  items: FaqItem[];
}

/**
 * The shape this app actually renders: the raw contract above with every
 * bilingual field resolved to a plain string. Derived from the raw type
 * rather than hand-written, so the two can't drift.
 */
export type LocalizedFaqSectionWithItems = LocalizedResult<FaqSectionWithItems>;
