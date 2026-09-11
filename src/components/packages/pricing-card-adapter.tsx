import { Diamond, Package as PackageIcon, Sparkles, Zap } from "lucide-react";
import type { LocalizedPackage, PricingTier } from "@/lib/domain/package";
import { Button } from "@/components/ui/button";
import AppRoute from "@/constant/AppRoute.enum";
import type { PricingCardProps } from "@/components/packages/pricing-card";
import { cn } from "@/lib/cn";

/** CMS `icon` is a free-text field, so an unrecognized value falls back rather than rendering nothing. */
const ICONS: Record<string, typeof Diamond> = { diamond: Diamond, package: PackageIcon, zap: Zap };

export interface ToPricingCardLabels {
  save: string;
  includes: string;
  subscribe: string;
}

/**
 * Owns every piece of `PricingCard` that is actually `LocalizedPackage`
 * knowledge: the free-text `icon` → component map, `followUpLabel` as the
 * subtitle, the deliberately un-formatted currency suffix (see the comment
 * on `savingsLabel` below), and the `AppRoute.Consultation` CTA. `tier` is
 * the caller's already-resolved pricing for whichever duration it is
 * showing — the full `/packages` board resolves this from its own duration
 * state; the homepage preview always passes the shortest duration.
 */
export function toPricingCardProps(
  pkg: LocalizedPackage,
  tier: PricingTier | undefined,
  currencyCode: string,
  labels: ToPricingCardLabels,
  featureLimit?: number,
): PricingCardProps {
  const Icon = ICONS[pkg.icon] ?? Sparkles;
  const savings = tier ? tier.originalPrice - tier.price : 0;

  return {
    isRecommended: pkg.popular,
    title: pkg.name,
    subtitle: pkg.followUpLabel || undefined,
    icon: <Icon className="size-icon-md" />,
    badge: pkg.tag || undefined,
    price: tier
      ? {
          current: tier.price,
          original: tier.originalPrice,
          // Currency comes from Site Settings, appended as its authored code
          // with no Intl reformatting — locale-aware currency formatting
          // would also convert the digits, and which numeral system Arabic
          // pricing should use is an open product question.
          currency: currencyCode,
          savingsLabel: savings > 0 ? `${labels.save} ${savings} ${currencyCode}` : undefined,
        }
      : undefined,
    features: pkg.details,
    featureLimit,
    // `primary` even for a non-recommended card: this is a genuine choice
    // between packages, so a weaker button would push visitors rather than
    // inform them. The recommended tier is already distinguished four other
    // ways.
    //
    // The recommended tier overrides `primary`'s own green fill to white:
    // `PricingCard` fills that one card with `bg-primary`, and the button's
    // `primary` variant is that identical green — a green CTA on a green
    // card has no visible edge. `cn`'s tailwind-merge resolves the
    // conflicting `bg-*`/`text-*`/hover utilities in `className` against
    // the ones baked into the `primary` variant, so this is a real override,
    // not two classes fighting. `focus-ring-on-dark` stays either way — it's
    // for "sitting on a background that isn't guaranteed light," which is
    // true here regardless of the button's own fill.
    action: (
      <Button
        href={`${AppRoute.Consultation}?package=${pkg.key}`}
        size="lg"
        className={cn(
          "w-full",
          pkg.popular && "bg-surface text-primary pointer:hover:bg-surface pointer:hover:text-primary-hover",
        )}
      >
        {labels.subscribe}
      </Button>
    ),
    labels: { includes: labels.includes },
  };
}
