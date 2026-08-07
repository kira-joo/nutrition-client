import type { LocalizedResult, ImageAsset, LocalizedString } from "@kira-joo/toolkit-common";

/**
 * Mirrors nutrition-staff's `GET /api/public/site-settings` response
 * (verified directly against the live endpoint, not just the backend's
 * own schema file — see docs/architecture.md). A singleton, no pagination.
 */
export interface SiteSettings {
  phone?: string;
  whatsappNumber?: string;
  email?: string;
  currencyCode: string;
  socialLinks: { platform: string; url: string; order: number }[];
  logo: ImageAsset | null;
  favicon: ImageAsset | null;
  defaultSeo: { title: LocalizedString; description: LocalizedString };
  ogImage?: ImageAsset | null;
  activeCampaignId?: string;
}

/**
 * The shape this app actually renders: the raw contract above with every
 * bilingual field resolved to a plain string. Derived from the raw type
 * rather than hand-written, so the two can't drift.
 */
export type LocalizedSiteSettings = LocalizedResult<SiteSettings>;
