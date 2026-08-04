import type { PublicEndpoint } from "../src/lib/api/public-endpoint.type";
import type { FaqItem, FaqSection } from "../src/lib/domain/faq";

export const getFaqSectionsEndpoint: PublicEndpoint<{ returnType: FaqSection[] }> = {
  url: "/api/public/faq-sections",
};

/** Flat list, not grouped by section — see groupFaqItemsBySection in src/lib/domain/faq.ts. */
export const getFaqItemsEndpoint: PublicEndpoint<{ returnType: FaqItem[] }> = {
  url: "/api/public/faq-items",
};
