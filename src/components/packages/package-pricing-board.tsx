"use client";
import { useId, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { LocalizedPackage, PackageDuration } from "@/lib/domain/package";
import { PackageCard } from "@/components/packages/package-card";

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
          // Matches Container's own sm:px-6 breakpoint exactly — without
          // this, the sticky bar sat 0.5rem inset from the page's real
          // gutter between 640–1023px (the negative margin at that width
          // still only cancelled the 4px/1rem tier).
          "sm:-mx-6 sm:px-6",
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

      {/* Rendered in the exact order the backend returned — no client-side sort, not even to lead with the popular tier. Column count follows the real count: 3+ packages earn a third column instead of forever capping at two and leaving a gap once the CMS grows past it. */}
      <ul className={cn("grid gap-8 sm:grid-cols-2 lg:col-span-2", packages.length >= 3 && "lg:grid-cols-3")}>
        {packages.map((pkg) => (
          <li key={pkg._id} className="flex">
            <PackageCard pkg={pkg} tier={pkg.pricingTiers[duration]} currencyCode={currencyCode} labels={labels} subscribeLabel={subscribeLabel} />
          </li>
        ))}
      </ul>
    </div>
  );
}
