import type { LocalizedResult } from "@kira-joo/toolkit-common";

/**
 * Mirrors the fields of nutrition-staff's `GET /api/public/site-settings`
 * response that the client actually reads — not the full staff schema.
 * `logo`, `favicon`, `defaultSeo`, and `ogImage` are real fields on the
 * staff side but are deliberately absent here: the public site's brand
 * identity and SEO metadata are now static and client-owned (the `seo`
 * next-intl namespace, `/images/logo.png`, and Next's file-based favicon
 * convention), not fetched — see `app/[locale]/layout.tsx`'s
 * `generateMetadata`. The staff-side fields themselves are untouched; a
 * TypeScript interface not declaring a field a JSON response happens to
 * include has no runtime effect, so trimming this type doesn't require
 * (or imply) any change to what staff serves.
 */
export interface SiteSettings {
  phone?: string;
  whatsappNumber?: string;
  email?: string;
  currencyCode: string;
  socialLinks: { platform: string; url: string; order: number }[];
  activeCampaignId?: string;
}

/**
 * The shape this app actually renders: the raw contract above with every
 * bilingual field resolved to a plain string. Derived from the raw type
 * rather than hand-written, so the two can't drift.
 */
export type LocalizedSiteSettings = LocalizedResult<SiteSettings>;
