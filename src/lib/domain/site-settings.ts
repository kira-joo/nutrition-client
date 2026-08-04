import type { ImageAsset, LocalizedString } from "@kira-joo/toolkit-common";

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
