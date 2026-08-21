import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/cn";
import { LABEL_TYPE } from "@/components/ui/typography";

export interface PricingCardPrice {
  current: number;
  original?: number;
  currency: string;
  savingsLabel?: string;
}

export interface PricingCardProps {
  /**
   * Semantic depth only — the heading's visual size is the card's design and does
   * not move with it. `h3` is right under a section heading, as on the homepage
   * previews; a browse page whose own `h1` is the nearest heading above the grid
   * passes `h2`, because skipping a level makes the document outline claim a
   * nesting that isn't there.
   */
  headingLevel?: "h2" | "h3";
  isRecommended: boolean;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  badge?: string;
  price?: PricingCardPrice;
  features: string[];
  featureLimit?: number;
  action: ReactNode;
  labels: { includes: string };
  className?: string;
}

/**
 * Package-*shaped* but package-agnostic: every prop is a plain value or
 * `ReactNode`, so this renders any priced, featured, optionally-recommended
 * tier — the adapter in `pricing-card-adapter.tsx` is what actually knows about
 * `LocalizedPackage`. Used by both `PackagePricingBoard` (the full
 * `/packages` page) and `PackagesPreviewSection` (the homepage); there is no
 * second, smaller "preview" card.
 */
export function PricingCard({ headingLevel: Heading = "h3", isRecommended, title, subtitle, icon, badge, price, features, featureLimit, action, labels, className }: PricingCardProps) {
  const details = featureLimit ? features.slice(0, featureLimit) : features;

  return (
    <article
      className={cn(
        "flex h-full w-full min-w-0 flex-col rounded-xl bg-surface p-8 transition-all duration-base ease-standard sm:p-10",
        // The recommended tier is marked by a heavier ring, raised elevation,
        // an offset position, and its own badge text — four redundant cues,
        // none of which is a color difference a low-vision or color-blind
        // visitor has to perceive. Both cards keep dark text on a light
        // surface, so contrast is identical either way.
        isRecommended
          ? "ring-2 ring-primary shadow-raised lg:-translate-y-4"
          : "border-hairline border-border shadow-sm pointer:hover:-translate-y-1 pointer:hover:shadow-md",
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-3">
        {icon && <span aria-hidden="true" className="flex size-icon-xl items-center justify-center rounded-full bg-primary-soft text-primary">{icon}</span>}
        <Heading className="min-w-0 break-words text-heading-3 font-bold text-text-primary">{title}</Heading>
        {badge && <span className="rounded-full bg-primary px-3 py-1 text-caption font-semibold uppercase tracking-wide text-white">{badge}</span>}
      </div>

      {subtitle && <p className="mt-3 break-words text-body-sm text-text-secondary">{subtitle}</p>}

      {price && (
        <div className="mt-6 border-t-hairline border-border pt-6">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            {price.original !== undefined && price.original > price.current && <span className="text-body-lg text-text-muted line-through">{price.original}</span>}
            <span className="text-stat font-extrabold text-text-primary">{price.current}</span>
            <span className="text-body-sm font-semibold text-text-secondary">{price.currency}</span>
          </div>
          {price.savingsLabel && <p className="mt-2 text-body-sm font-semibold text-success">{price.savingsLabel}</p>}
        </div>
      )}

      {details.length > 0 && (
        <>
          <p className={cn("mt-6", LABEL_TYPE, "text-text-muted")}>{labels.includes}</p>
          <ul className="mt-3 flex flex-1 flex-col gap-2.5">
            {details.map((detail, index) => (
              <li key={index} className="flex items-start gap-2.5 text-body-sm text-text-secondary">
                <Check aria-hidden="true" className="mt-0.5 size-icon-sm shrink-0 text-primary" />
                <span className="min-w-0 break-words">{detail}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      <div className="mt-8">{action}</div>
    </article>
  );
}
