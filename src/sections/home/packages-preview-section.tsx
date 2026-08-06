import { getTranslations } from "next-intl/server";
import { cn } from "@kira-joo/frontend-toolkit-tailwind/server";
import { resolveLocalized } from "@kira-joo/toolkit-common";
import type { Package } from "@/lib/domain/package";
import type { PackagesPageSettings } from "@/lib/domain/packages-page-settings";
import type { Locale } from "@/constant/Locale.enum";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";

export interface PackagesPreviewSectionProps {
  packages: Package[];
  packagesPageSettings: PackagesPageSettings;
  locale: Locale;
}

const PREVIEW_DURATION = "month";

/**
 * A single duration only (the shortest — `month`) — the full duration
 * toggle belongs to the real `/packages` page, not this preview. Package
 * order is rendered exactly as the backend returned it (see
 * docs/architecture.md: no client-side default sort for packages). The
 * popular tier uses the `bg-cta` gradient token (deep-filled emphasis,
 * docs/design-system.md's second card family) and is raised on desktop
 * only — mobile has no side-by-side row to raise it above.
 */
export async function PackagesPreviewSection({ packages, packagesPageSettings, locale }: PackagesPreviewSectionProps) {
  if (packages.length === 0) return null;
  const t = await getTranslations("home");

  return (
    <Section className="bg-surface-muted">
      <Container>
        <Reveal className="flex flex-col items-start gap-2">
          <p className="text-label font-semibold uppercase tracking-wide text-accent">{resolveLocalized(packagesPageSettings.subtitle, locale)}</p>
          <h2 className="text-heading-1 font-bold text-text-primary">
            {resolveLocalized(packagesPageSettings.title, locale)} <span className="text-primary">{resolveLocalized(packagesPageSettings.titleAccent, locale)}</span>
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg, index) => {
            const tier = pkg.pricingTiers[PREVIEW_DURATION];
            return (
              <Reveal
                key={pkg._id}
                delay={index * 0.08}
                className={cn(
                  "flex flex-col rounded-xl p-6",
                  pkg.popular ? "bg-cta text-white shadow-raised lg:-translate-y-3" : "border-hairline border-border bg-surface text-text-primary shadow-sm"
                )}
              >
                <span className={cn("text-body-sm font-semibold", pkg.popular ? "text-white/80" : "text-text-muted")}>{resolveLocalized(pkg.name, locale)}</span>
                {tier && (
                  <div className="mt-3 flex items-baseline gap-2">
                    {tier.originalPrice > tier.price && (
                      <span className={cn("text-body-sm line-through", pkg.popular ? "text-white/60" : "text-text-muted")}>{tier.originalPrice}</span>
                    )}
                    <span className="text-heading-1 font-extrabold">{tier.price}</span>
                  </div>
                )}
                <ul className={cn("mt-5 flex flex-1 flex-col gap-2 text-body-sm", pkg.popular ? "text-white/90" : "text-text-secondary")}>
                  {pkg.details.slice(0, 4).map((detail, detailIndex) => (
                    <li key={detailIndex}>{resolveLocalized(detail, locale)}</li>
                  ))}
                </ul>
                <Button href={`/consultation?package=${pkg.key}`} variant={pkg.popular ? "secondary" : "primary"} className={pkg.popular ? "mt-6 border-white bg-white text-primary hover:bg-white/90 hover:text-primary" : "mt-6"}>
                  {resolveLocalized(packagesPageSettings.subscribeButtonLabel, locale)}
                </Button>
              </Reveal>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <Button href="/packages" variant="ghost">
            {t("packages.viewAll")}
          </Button>
        </div>
      </Container>
    </Section>
  );
}
