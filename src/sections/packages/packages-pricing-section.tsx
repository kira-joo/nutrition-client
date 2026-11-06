import { getTranslations } from "next-intl/server";
import { PackageX } from "lucide-react";
import { PACKAGE_DURATIONS } from "@/lib/domain/package";
import type { LocalizedPackage } from "@/lib/domain/package";
import type { LocalizedPackagesPageSettings } from "@/lib/domain/packages-page-settings";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { PackagePricingBoard } from "@/components/packages/package-pricing-board";
import { EmptyPanel } from "@/components/ui/empty-panel";
import { PageHeader } from "@/components/ui/page-header";

export interface PackagesPricingSectionProps {
  packagesPageSettings: LocalizedPackagesPageSettings;
  packages: LocalizedPackage[];
  currencyCode: string;
}

/**
 * Desktop puts the heading and the duration control on one row above the
 * cards, which then get the container's full width — rather than a centered
 * stack widened out, or a narrow sticky sidebar squeezing the display-size
 * heading into six lines. `PackagePricingBoard` itself decides the column
 * count from the real package count (2 → two columns, 3+ → three), so this
 * composition doesn't need to special-case either case. Below `lg` it
 * collapses to heading, then a duration control that sticks under the site
 * header, then the cards.
 *
 * Every string here arrives already resolved from the data layer, so this
 * section has no locale to know about.
 */
export async function PackagesPricingSection({
  packagesPageSettings,
  packages,
  currencyCode,
}: PackagesPricingSectionProps) {
  const t = await getTranslations("packages");

  // A duration with no authored label is dropped rather than shown with a raw key.
  const durations = PACKAGE_DURATIONS.map((value) => ({
    value,
    label: packagesPageSettings.durationLabels[value],
  })).filter((option) => option.label);

  /* `max-w-narrow` on the block rather than on the heading, which is where the
     hand-rolled copy had it. With no action in this header the two constrain the
     same thing, and the eyebrow above it is a short label that the narrower box
     does not rewrap. */
  const header = (
    <PageHeader
      className="max-w-narrow"
      eyebrow={packagesPageSettings.subtitle || undefined}
      title={packagesPageSettings.title}
      titleAccent={packagesPageSettings.titleAccent || undefined}
    />
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
            <EmptyPanel icon={PackageX} message={t("empty.noPackages")} />
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
