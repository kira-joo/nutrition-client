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
 *
 * Second pass on this card, after the first read as "generic card with a
 * leaf sticker" rather than premium. What changed: the leaf watermark and
 * leaf-icon price divider are gone — a botanical accent inside a pricing
 * card competed with the "minimal medical luxury" brief instead of serving
 * it. The one accent colour now is a restrained gold (`--color-gold` /
 * `-on-dark` / `-soft`), used only as hairline rules and the recommended
 * card's border — never as body text, which is why it's a decorative
 * colour rather than one carried through the type system.
 *
 * The recommended tier is still a genuinely different *object*, not a
 * lighter card with a ring around it: a deep `primary` fill, white text,
 * a thin gold border standing in for the leaf mark as the "this one is
 * different" cue, and `shadow-package` — the deepest shadow in the system.
 * Its CTA remains white-on-transparent-card contrast (handled by the
 * adapter) rather than the primary-on-primary button that disappeared
 * into the fill.
 *
 * Original vs current price is stacked, not inlined — a struck-through
 * number sitting on its own small line above the real price reads as "was
 * X" clearly, where the previous inline "1250 850 EGP" read as one string
 * of digits at a glance.
 */
export function PricingCard({ headingLevel: Heading = "h3", isRecommended, title, subtitle, icon, badge, price, features, featureLimit, action, labels, className }: PricingCardProps) {
  const details = featureLimit ? features.slice(0, featureLimit) : features;
  const hasSavings = price?.original !== undefined && price.original > price.current;

  return (
    <article
      className={cn(
        "relative flex h-full w-full min-w-0 flex-col overflow-hidden surface-notched p-8 transition-all duration-base ease-standard sm:p-10",
        isRecommended
          ? "border border-gold-on-dark/50 bg-primary text-white shadow-package lg:-translate-y-4"
          : "border-hairline border-primary/10 bg-surface text-text-primary shadow-sm pointer:hover:-translate-y-1 pointer:hover:shadow-md",
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-3">
        {icon && (
          <span
            aria-hidden="true"
            className={cn(
              "flex size-icon-xl items-center justify-center rounded-full",
              isRecommended ? "bg-white/15 text-white" : "bg-primary-soft text-primary"
            )}
          >
            {icon}
          </span>
        )}
        <Heading className="min-w-0 break-words text-heading-3 font-black">{title}</Heading>
        {badge && (
          <span
            className={cn(
              "rounded-full px-3 py-1 text-caption font-semibold uppercase tracking-wide",
              isRecommended ? "bg-gold-soft text-primary" : "bg-primary text-white"
            )}
          >
            {badge}
          </span>
        )}
      </div>

      {subtitle && <p className={cn("mt-3 break-words text-body-sm", isRecommended ? "text-white/75" : "text-text-secondary")}>{subtitle}</p>}

      {price && (
        <>
          {/* The one restrained gold accent every card shares — a hairline
              rule, never an icon or a filled shape. */}
          <div className={cn("mt-6 h-px w-12", isRecommended ? "bg-gold-on-dark" : "bg-gold")} />

          <div className="mt-5">
            {hasSavings && (
              <span className={cn("block text-body-sm line-through", isRecommended ? "text-white/50" : "text-text-muted")}>
                {price.original} {price.currency}
              </span>
            )}
            <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <span className="text-stat font-black tabular-nums">{price.current}</span>
              <span className={cn("text-body-sm font-semibold", isRecommended ? "text-white/75" : "text-text-secondary")}>{price.currency}</span>
            </div>
            {price.savingsLabel && (
              <p
                className={cn(
                  "mt-2 inline-flex rounded-full px-3 py-1 text-body-sm font-semibold",
                  isRecommended ? "bg-white/15 text-white" : "bg-primary-soft text-success"
                )}
              >
                {price.savingsLabel}
              </p>
            )}
          </div>
        </>
      )}

      {details.length > 0 && (
        <>
          <p className={cn("mt-6", LABEL_TYPE, isRecommended ? "text-white/60" : "text-text-muted")}>{labels.includes}</p>
          <ul className="mt-3 flex flex-1 flex-col gap-3">
            {details.map((detail, index) => (
              <li key={index} className="flex items-start gap-2.5 text-body-sm">
                <span
                  aria-hidden="true"
                  className={cn(
                    "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full",
                    isRecommended ? "bg-white/15" : "bg-primary-soft"
                  )}
                >
                  <Check className={cn("size-3", isRecommended ? "text-white" : "text-primary")} />
                </span>
                <span className={cn("min-w-0 break-words", isRecommended ? "text-white/90" : "text-text-secondary")}>{detail}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      <div className="mt-8">{action}</div>
    </article>
  );
}
