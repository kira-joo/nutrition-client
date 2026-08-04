import type { LocalizedString } from "@kira-joo/toolkit-common";

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
