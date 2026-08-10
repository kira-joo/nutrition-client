import type { LocalizedResult, LocalizedString } from "@kira-joo/toolkit-common";

export type PackageDuration = "month" | "quarter" | "half";

export interface PricingTier {
  originalPrice: number;
  price: number;
}

/** Mirrors `GET /api/public/packages` — a plain array, unpaginated, published-only. */
export interface Package {
  _id: string;
  key: string;
  name: LocalizedString;
  tag?: LocalizedString;
  popular: boolean;
  variant: string;
  icon: string;
  followUpLabel: LocalizedString;
  pricingTiers: Record<PackageDuration, PricingTier>;
  details: LocalizedString[];
  order: number;
  seoOverride?: { title: LocalizedString; description: LocalizedString };
}

/**
 * The shape this app actually renders: the raw contract above with every
 * bilingual field resolved to a plain string. Derived from the raw type
 * rather than hand-written, so the two can't drift.
 */
export type LocalizedPackage = LocalizedResult<Package>;
