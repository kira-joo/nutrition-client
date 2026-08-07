"use client";
import { useId, useState, type ReactNode } from "react";
import { Check, Diamond, Package as PackageIcon, Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";
import type { LocalizedPackage, PackageDuration } from "@/lib/domain/package";
import { Button } from "@/components/ui/button";
import AppRoute from "@/constant/AppRoute.enum";

export interface PackagePricingBoardProps {
  /**
   * Already localized at the data-layer boundary, so this client bundle
   * carries plain strings and no locale machinery. `tag` can be `""` when
   * unauthored (VIP's is empty in both locales on the live CMS today), which
   * is why the badge is conditional.
   */
  packages: LocalizedPackage[];
  /** Ordered duration options with their authored labels. Only durations the CMS actually labels appear. */
  durations: { value: PackageDuration; label: string }[];
  subscribeLabel: string;
  currencyCode: string;
  labels: { save: string; chooseDuration: string; includes: string };
  /** Rendered by the server section; shares the desktop row with the duration control. */
  header: ReactNode;
}

/** CMS `icon` is a free-text field, so an unrecognized value falls back rather than rendering nothing. */
const ICONS: Record<string, typeof Diamond> = { diamond: Diamond, package: PackageIcon };

export function PackagePricingBoard({ packages, durations, subscribeLabel, currencyCode, labels, header }: PackagePricingBoardProps) {
  const groupName = useId();
  const [duration, setDuration] = useState<PackageDuration>(durations[0]?.value ?? "month");

  return (
    /*
      One grid for heading, control, and cards rather than a header row
      wrapping the first two. `position: sticky` only holds while its
      containing block is in view, so nesting the control in a short wrapper
      let it scroll away with that wrapper — measured at top: -815px on
      mobile, which defeated the whole point of keeping durations reachable
      while comparing cards further down. As a direct child of the grid that
      also contains the cards, it sticks for the full length of the
      comparison.
    */
    <div className="grid gap-8 lg:grid-cols-2 lg:items-end">
      {header}
      {/*
        Native radios rather than buttons with aria-pressed: a duration is a
        single choice from a set, so a radio group is the correct semantic
        and brings arrow-key navigation and one-Tab-stop behavior for free
        instead of reimplementing both.
      */}
      <fieldset
        className={cn(
          "sticky top-16 z-sticky-cta -mx-4 border-b-hairline border-border bg-background/95 px-4 py-3 backdrop-blur",
          "lg:static lg:mx-0 lg:justify-self-end lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none"
        )}
      >
        <legend className="sr-only">{labels.chooseDuration}</legend>
        <div className="flex flex-wrap gap-2 rounded-full border-hairline border-border bg-surface p-1 lg:inline-flex">
          {durations.map((option) => {
            const isActive = option.value === duration;
            return (
              <label
                key={option.value}
                className={cn(
                  "flex-1 cursor-pointer rounded-full px-4 py-2 text-center text-body-sm font-semibold transition-colors duration-base ease-standard lg:flex-none",
                  "focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-focus",
                  isActive ? "bg-primary text-white" : "text-text-secondary hover:text-text-primary"
                )}
              >
                <input
                  type="radio"
                  name={groupName}
                  value={option.value}
                  checked={isActive}
                  onChange={() => setDuration(option.value)}
                  className="sr-only"
                />
                {option.label}
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* Rendered in the exact order the backend returned — no client-side sort, not even to lead with the popular tier. */}
      <ul className="grid gap-6 sm:grid-cols-2 lg:col-span-2">
        {packages.map((pkg) => {
          const tier = pkg.pricingTiers[duration];
          const Icon = ICONS[pkg.icon] ?? Sparkles;
          const savings = tier ? tier.originalPrice - tier.price : 0;

          return (
            <li key={pkg._id} className="flex">
              <article
                className={cn(
                  "flex w-full min-w-0 flex-col rounded-xl bg-surface p-6 transition-shadow duration-base ease-standard sm:p-8",
                  // The popular tier is marked by a heavier ring, raised
                  // elevation, an offset position, and the CMS's own tag
                  // text — four redundant cues, none of which is a color
                  // difference a low-vision or color-blind visitor has to
                  // perceive. Both cards keep dark text on a light surface,
                  // so contrast is identical either way.
                  pkg.popular
                    ? "ring-2 ring-primary shadow-raised lg:-translate-y-4"
                    : "border-hairline border-border shadow-sm hover:shadow-md"
                )}
              >
                <div className="flex flex-wrap items-center gap-3">
                  <span aria-hidden="true" className="flex size-icon-xl items-center justify-center rounded-full bg-primary-soft text-primary">
                    <Icon className="size-icon-md" />
                  </span>
                  <h3 className="min-w-0 break-words text-heading-3 font-bold text-text-primary">{pkg.name}</h3>
                  {pkg.tag && (
                    <span className="rounded-full bg-primary px-3 py-1 text-caption font-semibold uppercase tracking-wide text-white">{pkg.tag}</span>
                  )}
                </div>

                {pkg.followUpLabel && <p className="mt-3 break-words text-body-sm text-text-secondary">{pkg.followUpLabel}</p>}

                {tier && (
                  <div className="mt-6 border-t-hairline border-border pt-6">
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      {tier.originalPrice > tier.price && (
                        <span className="text-body-lg text-text-muted line-through">{tier.originalPrice}</span>
                      )}
                      <span className="text-stat font-extrabold text-text-primary">{tier.price}</span>
                      {/* Currency comes from Site Settings, appended as its authored code with no Intl reformatting — locale-aware currency formatting would also convert the digits, and which numeral system Arabic pricing should use is an open product question (plan §29). */}
                      <span className="text-body-sm font-semibold text-text-secondary">{currencyCode}</span>
                    </div>
                    {savings > 0 && (
                      <p className="mt-2 text-body-sm font-semibold text-success">
                        {labels.save} {savings} {currencyCode}
                      </p>
                    )}
                  </div>
                )}

                {pkg.details.length > 0 && (
                  <>
                    <p className="mt-6 text-label font-semibold uppercase tracking-wide text-text-muted">{labels.includes}</p>
                    <ul className="mt-3 flex flex-1 flex-col gap-2.5">
                      {pkg.details.map((detail, index) => (
                        <li key={index} className="flex items-start gap-2.5 text-body-sm text-text-secondary">
                          <Check aria-hidden="true" className="mt-0.5 size-icon-sm shrink-0 text-primary" />
                          <span className="min-w-0 break-words">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                {/* Both CTAs are `primary`: this is a genuine choice between two packages, so giving the non-popular one a weaker button would push visitors rather than inform them. The popular tier is already distinguished four other ways. */}
                <Button href={`${AppRoute.Consultation}?package=${pkg.key}`} className="mt-8 w-full">
                  {subscribeLabel}
                </Button>
              </article>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
