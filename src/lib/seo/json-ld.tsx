import type { LocalizedSiteSettings } from "@/lib/domain/site-settings";
import { SITE_ORIGIN } from "@/lib/config/site-origin.constant";

/**
 * Only the one JSON-LD block this phase actually ships: a site-wide
 * `MedicalBusiness` identity, rendered once from the root layout. Per-route
 * structured data (Recipe, FAQPage, VideoObject, BreadcrumbList, etc.) is a
 * real future need but is deliberately deferred to a dedicated SEO/metadata
 * phase where the whole site's metadata strategy gets designed
 * intentionally together, rather than accreting per product phase.
 *
 * `logo`/`image` and `description` are the fixed brand-identity fields —
 * passed in as plain strings from the caller's static `seo` translations
 * and the local `/images/logo.png` asset, not read off `siteSettings`
 * anymore (that field is `siteSettings.logo`/`.defaultSeo.description`,
 * which this used to read directly). `phone`/`email`/`sameAs` stay off
 * `siteSettings`: real, editable business contact info that an editor
 * legitimately updates, unlike the fixed title/description/logo triad.
 */
export function buildOrganizationJsonLd(
  siteSettings: LocalizedSiteSettings,
  clinicName: string,
  brand: { description: string; logoPath: string },
) {
  // JSON-LD wants an absolute URL, unlike Next's Metadata API (which
  // resolves a relative one against `metadataBase` itself) — built from
  // the same `SITE_ORIGIN` `metadataBase` is built from.
  const logoUrl = `${SITE_ORIGIN}${brand.logoPath}`;

  return {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    name: clinicName,
    url: SITE_ORIGIN,
    logo: logoUrl,
    image: logoUrl,
    ...(siteSettings.phone ? { telephone: siteSettings.phone } : {}),
    ...(siteSettings.email ? { email: siteSettings.email } : {}),
    description: brand.description,
    sameAs: siteSettings.socialLinks.map((link) => link.url),
  };
}

/** Renders a builder's output into a real `<script>` tag — the one place `dangerouslySetInnerHTML` is used for JSON-LD, since React would otherwise HTML-escape the JSON and break it. */
export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
