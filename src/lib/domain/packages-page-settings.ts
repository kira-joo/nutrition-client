import type { LocalizedResult, LocalizedString } from "@kira-joo/toolkit-common";

/** Mirrors `GET /api/public/packages-page-settings` — a singleton. */
export interface PackagesPageSettings {
  title: LocalizedString;
  titleAccent: LocalizedString;
  subtitle: LocalizedString;
  durationLabels: { month: LocalizedString; quarter: LocalizedString; half: LocalizedString };
  subscribeButtonLabel: LocalizedString;
}

/**
 * The shape this app actually renders: the raw contract above with every
 * bilingual field resolved to a plain string. Derived from the raw type
 * rather than hand-written, so the two can't drift.
 */
export type LocalizedPackagesPageSettings = LocalizedResult<PackagesPageSettings>;
