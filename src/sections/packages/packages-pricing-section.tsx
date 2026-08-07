import { getTranslations } from "next-intl/server";
import { PackageX } from "lucide-react";
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

  const header = (
    <header className="flex flex-col items-start gap-3">
      {packagesPageSettings.subtitle && (
        <p className="text-label font-semibold uppercase tracking-wide text-accent">{packagesPageSettings.subtitle}</p>
      )}
      <h1 className="max-w-narrow text-display font-extrabold text-text-primary">
        {packagesPageSettings.title}{" "}
        {packagesPageSettings.titleAccent && <span className="text-primary">{packagesPageSettings.titleAccent}</span>}
      </h1>
    </header>
  );

  return (
    <Section>
      <Container>
        {packages.length === 0 ? (
          // No duration control here: it exists to compare cards, and there's
          // nothing to compare. Header still renders — the page's `<h1>` and
          // intro copy remain true even while the CMS has nothing published.
          <div className="flex flex-col gap-8">
            {header}
            <div className="flex flex-col items-center gap-3 rounded-xl border-hairline border-border bg-surface-muted px-6 py-14 text-center">
              <PackageX aria-hidden="true" className="size-icon-xl text-text-muted" />
              <p className="max-w-md break-words text-body-lg font-semibold text-text-primary">{t("empty.noPackages")}</p>
            </div>
          </div>
        ) : (
          <PackagePricingBoard
            packages={packages}
            durations={durations}
            subscribeLabel={packagesPageSettings.subscribeButtonLabel}
            currencyCode={currencyCode}
            labels={{ save: t("save"), chooseDuration: t("chooseDuration"), includes: t("includes") }}
            header={header}
          />
        )}
      </Container>
    </Section>
  );
}
