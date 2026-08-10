import { getPackages, getPackagesPageSettings, getSiteSettings } from "@/lib/data";
import type { Locale } from "@/constant/Locale.enum";
import { PackagesPricingSection } from "@/sections/packages/packages-pricing-section";
import { ClosingCtaSection } from "@/sections/shared/closing-cta-section";

interface PackagesPageProps {
  params: { locale: Locale };
}

/**
 * All three sources are required for the page to mean anything — settings
 * for the heading and duration labels, packages for the cards, site
 * settings for the currency — so no `safe()` isolation here: a failure
 * belongs in `error.tsx` rather than rendering a pricing page with no
 * prices. That differs from the homepage deliberately, where each module is
 * independent and one failure must not blank the rest.
 */
export default async function PackagesPage({ params }: PackagesPageProps) {
  const { locale } = params;
  const [packagesPageSettings, packages, siteSettings] = await Promise.all([
    getPackagesPageSettings(locale),
    getPackages(locale),
    getSiteSettings(locale),
  ]);

  return (
    <>
      <PackagesPricingSection packagesPageSettings={packagesPageSettings} packages={packages} currencyCode={siteSettings.currencyCode} />
      <ClosingCtaSection />
    </>
  );
}
