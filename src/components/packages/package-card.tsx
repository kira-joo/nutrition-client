import { Check, Diamond, Package as PackageIcon, Sparkles, Zap } from "lucide-react";
import { cn } from "@/lib/cn";
import type { LocalizedPackage } from "@/lib/domain/package";
import { Button } from "@/components/ui/button";
import AppRoute from "@/constant/AppRoute.enum";

/** CMS `icon` is a free-text field, so an unrecognized value falls back rather than rendering nothing. */
const ICONS: Record<string, typeof Diamond> = { diamond: Diamond, package: PackageIcon, zap: Zap };

export interface PackageCardProps {
  pkg: LocalizedPackage;
  /** The already-resolved tier for whichever duration the caller is showing — the full `/packages` board resolves this from its own duration state; the homepage preview always shows the shortest duration. */
  tier?: { originalPrice: number; price: number };
  currencyCode: string;
  labels: { save: string; includes: string };
  subscribeLabel: string;
  /** Caps the visible feature list — the homepage preview shows fewer than the full board. Omit to show every detail. */
  maxDetails?: number;
  className?: string;
}

/**
 * The one canonical package card — used by both `PackagePricingBoard`
 * (the full `/packages` page) and `PackagesPreviewSection` (the homepage).
 * There is no second, smaller "preview" card: the homepage previously
 * rendered its own inline article with different padding, a dark
 * `bg-cta` gradient for the popular tier, and no `pointer:hover` lift —
 * a visibly different design for the same domain entity. Column count,
 * item count, and the duration switcher are the *section's* job; this
 * component only owns how one package presents.
 */
export function PackageCard({ pkg, tier, currencyCode, labels, subscribeLabel, maxDetails, className }: PackageCardProps) {
  const Icon = ICONS[pkg.icon] ?? Sparkles;
  const savings = tier ? tier.originalPrice - tier.price : 0;
  const details = maxDetails ? pkg.details.slice(0, maxDetails) : pkg.details;

  return (
    <article
      className={cn(
        "flex h-full w-full min-w-0 flex-col rounded-xl bg-surface p-8 transition-all duration-base ease-standard sm:p-10",
        // The popular tier is marked by a heavier ring, raised elevation,
        // an offset position, and the CMS's own tag text — four redundant
        // cues, none of which is a color difference a low-vision or
        // color-blind visitor has to perceive. Both cards keep dark text
        // on a light surface, so contrast is identical either way.
        pkg.popular
          ? "ring-2 ring-primary shadow-raised lg:-translate-y-4"
          : "border-hairline border-border shadow-sm pointer:hover:-translate-y-1 pointer:hover:shadow-md",
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-3">
        <span aria-hidden="true" className="flex size-icon-xl items-center justify-center rounded-full bg-primary-soft text-primary">
          <Icon className="size-icon-md" />
        </span>
        <h3 className="min-w-0 break-words text-heading-3 font-bold text-text-primary">{pkg.name}</h3>
        {pkg.tag && <span className="rounded-full bg-primary px-3 py-1 text-caption font-semibold uppercase tracking-wide text-white">{pkg.tag}</span>}
      </div>

      {pkg.followUpLabel && <p className="mt-3 break-words text-body-sm text-text-secondary">{pkg.followUpLabel}</p>}

      {tier && (
        <div className="mt-6 border-t-hairline border-border pt-6">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            {tier.originalPrice > tier.price && <span className="text-body-lg text-text-muted line-through">{tier.originalPrice}</span>}
            <span className="text-stat font-extrabold text-text-primary">{tier.price}</span>
            {/* Currency comes from Site Settings, appended as its authored code with no Intl reformatting — locale-aware currency formatting would also convert the digits, and which numeral system Arabic pricing should use is an open product question. */}
            <span className="text-body-sm font-semibold text-text-secondary">{currencyCode}</span>
          </div>
          {savings > 0 && (
            <p className="mt-2 text-body-sm font-semibold text-success">
              {labels.save} {savings} {currencyCode}
            </p>
          )}
        </div>
      )}

      {details.length > 0 && (
        <>
          <p className="mt-6 text-label font-semibold uppercase tracking-wide text-text-muted">{labels.includes}</p>
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

      {/* `primary` even for a non-popular card: this is a genuine choice between packages, so a weaker button would push visitors rather than inform them. The popular tier is already distinguished four other ways. */}
      <Button href={`${AppRoute.Consultation}?package=${pkg.key}`} size="lg" className="mt-8 w-full">
        {subscribeLabel}
      </Button>
    </article>
  );
}
