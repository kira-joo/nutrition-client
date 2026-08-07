import { getTranslations } from "next-intl/server";
import type { PackageDuration } from "@/lib/domain/package";
import type { LocalizedPackage } from "@/lib/domain/package";
import type { LocalizedPackagesPageSettings } from "@/lib/domain/packages-page-settings";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { PackagePricingBoard } from "@/components/packages/package-pricing-board";

export interface PackagesPricingSectionProps {
  packagesPageSettings: LocalizedPackagesPageSettings;
  packages: LocalizedPackage[];
  currencyCode: string;
}

/** Fixed set the CMS's `durationLabels` is keyed by; a duration with no authored label is dropped rather than shown with a raw key. */
const DURATIONS: PackageDuration[] = ["month", "quarter", "half"];

/**
 * Desktop puts the heading and the duration control on one row above the
 * cards, which then get the container's full width — rather than a centered
 * stack widened out. With only two packages in the CMS, a three-across grid
 * would leave a hole and a narrow sticky sidebar squeezed the display-size
 * heading into six lines; this composition uses the width without either.
 * Below `lg` it collapses to heading, then a duration control that sticks
 * under the site header, then the cards.
 *
 * Every string here arrives already resolved from the data layer, so this
 * section has no locale to know about.
 */
export async function PackagesPricingSection({ packagesPageSettings, packages, currencyCode }: PackagesPricingSectionProps) {
  const t = await getTranslations("packages");

  const durations = DURATIONS.map((value) => ({ value, label: packagesPageSettings.durationLabels[value] })).filter((option) => option.label);

  return (
    <Section>
      <Container>
        <PackagePricingBoard
          packages={packages}
          durations={durations}
          subscribeLabel={packagesPageSettings.subscribeButtonLabel}
          currencyCode={currencyCode}
          labels={{ save: t("save"), chooseDuration: t("chooseDuration"), includes: t("includes") }}
          header={
            <header className="flex flex-col items-start gap-3">
              {packagesPageSettings.subtitle && (
                <p className="text-label font-semibold uppercase tracking-wide text-accent">{packagesPageSettings.subtitle}</p>
              )}
              <h1 className="max-w-narrow text-display font-extrabold text-text-primary">
                {packagesPageSettings.title}{" "}
                {packagesPageSettings.titleAccent && <span className="text-primary">{packagesPageSettings.titleAccent}</span>}
              </h1>
            </header>
          }
        />
      </Container>
    </Section>
  );
}
