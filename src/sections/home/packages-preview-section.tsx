import { getTranslations } from "next-intl/server";
import type { LocalizedPackage } from "@/lib/domain/package";
import type { LocalizedPackagesPageSettings } from "@/lib/domain/packages-page-settings";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { SectionHeader } from "@/components/ui/section-header";
import { RevealGroup } from "@/components/ui/reveal";
import { PackageCard } from "@/components/packages/package-card";
import AppRoute from "@/constant/AppRoute.enum";

export interface PackagesPreviewSectionProps {
  packages: LocalizedPackage[];
  packagesPageSettings: LocalizedPackagesPageSettings;
  currencyCode: string;
}

const PREVIEW_DURATION = "month";
/** The full board shows every detail; the preview caps the list so the card stays a teaser, not the whole page duplicated. */
const PREVIEW_MAX_DETAILS = 4;

/**
 * Renders the exact same `PackageCard` the full `/packages` page uses —
 * there is no second, homepage-only package card. Only what a *section*
 * should own differs from the board: a single duration (the shortest —
 * the full duration toggle belongs to `/packages`, not this preview),
 * a capped detail list, and no sticky duration control. Package order is
 * rendered exactly as the backend returned it, matching the board.
 */
export async function PackagesPreviewSection({ packages, packagesPageSettings, currencyCode }: PackagesPreviewSectionProps) {
  if (packages.length === 0) return null;
  const t = await getTranslations("home");
  const tPackages = await getTranslations("packages");

  return (
    <Section className="bg-surface-muted">
      <Container>
        <SectionHeader
          eyebrow={packagesPageSettings.subtitle}
          title={packagesPageSettings.title}
          titleAccent={packagesPageSettings.titleAccent}
          actionLabel={t("packages.viewAll")}
          actionHref={AppRoute.Packages}
        />

        <RevealGroup className="mt-heading-gap grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {packages.map((pkg) => (
            <div key={pkg._id} className="flex">
              <PackageCard
                pkg={pkg}
                tier={pkg.pricingTiers[PREVIEW_DURATION]}
                currencyCode={currencyCode}
                labels={{ save: tPackages("save"), includes: tPackages("includes") }}
                subscribeLabel={packagesPageSettings.subscribeButtonLabel}
                maxDetails={PREVIEW_MAX_DETAILS}
              />
            </div>
          ))}
        </RevealGroup>
      </Container>
    </Section>
  );
}
