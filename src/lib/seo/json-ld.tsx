import type { LocalizedSiteSettings } from "@/lib/domain/site-settings";
import { SITE_ORIGIN } from "@/lib/config/site-origin.constant";

/**
 * Only the one JSON-LD block this phase actually ships: a site-wide
 * `MedicalBusiness` identity, rendered once from the root layout. Per-route
 * structured data (Recipe, FAQPage, VideoObject, BreadcrumbList, etc.) is a
 * real future need but is deliberately deferred to a dedicated SEO/metadata
 * phase where the whole site's metadata strategy gets designed
 * intentionally together, rather than accreting per product phase.
 */
export function buildOrganizationJsonLd(siteSettings: LocalizedSiteSettings, clinicName: string) {
  return {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    name: clinicName,
    url: SITE_ORIGIN,
    ...(siteSettings.logo ? { logo: siteSettings.logo.secureUrl, image: siteSettings.logo.secureUrl } : {}),
    ...(siteSettings.phone ? { telephone: siteSettings.phone } : {}),
    ...(siteSettings.email ? { email: siteSettings.email } : {}),
    description: siteSettings.defaultSeo.description || undefined,
    sameAs: siteSettings.socialLinks.map((link) => link.url),
  };
}

/** Renders a builder's output into a real `<script>` tag — the one place `dangerouslySetInnerHTML` is used for JSON-LD, since React would otherwise HTML-escape the JSON and break it. */
export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
