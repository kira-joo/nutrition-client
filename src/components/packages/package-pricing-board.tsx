"use client";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { LocalizedPackage, PackageDuration } from "@/lib/domain/package";
import { PACKAGE_DURATIONS } from "@/lib/domain/package";
import { PricingCard } from "@/components/packages/pricing-card";
import { SegmentedControl } from "@/components/packages/segmented-control";
import { toPricingCardProps } from "@/components/packages/pricing-card-adapter";

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

export function PackagePricingBoard({
  packages,
  durations,
  subscribeLabel,
  currencyCode,
  labels,
  header,
}: PackagePricingBoardProps) {
  const [duration, setDuration] = useState<PackageDuration>(durations[0]?.value ?? PACKAGE_DURATIONS[0]);

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
      {/* No control when the CMS has labelled no durations at all: the board
          still prices every card off the fallback duration, but an empty
          sticky fieldset would be a labelled group with nothing in it —
          announced to a screen reader as an empty control, and visually just
          a stray bar. */}
      {durations.length > 0 && (
        <SegmentedControl
          legend={labels.chooseDuration}
          options={durations}
          value={duration}
          onChange={setDuration}
          className={cn(
            "sticky top-16 z-sticky-cta -mx-4 border-b-hairline border-border bg-background/95 px-4 py-3 backdrop-blur",
            // Matches Container's own sm:px-6 breakpoint exactly — without
            // this, the sticky bar sat 0.5rem inset from the page's real
            // gutter between 640–1023px (the negative margin at that width
            // still only cancelled the 4px/1rem tier).
            "sm:-mx-6 sm:px-6",
            "lg:static lg:mx-0 lg:justify-self-end lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none",
          )}
        />
      )}

      {/* Rendered in the exact order the backend returned — no client-side sort, not even to lead with the popular tier. Column count follows the real count: 3+ packages earn a third column instead of forever capping at two and leaving a gap once the CMS grows past it. */}
      <ul className={cn("grid gap-8 sm:grid-cols-2 lg:col-span-2", packages.length >= 3 && "lg:grid-cols-3")}>
        {packages.map((pkg) => (
          <li key={pkg._id} className="flex">
            <PricingCard
              {...toPricingCardProps(pkg, pkg.pricingTiers[duration], currencyCode, {
                ...labels,
                subscribe: subscribeLabel,
              })}
              headingLevel="h2"
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
