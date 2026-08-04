import type { LocalizedString } from "@kira-joo/toolkit-common";

/** Mirrors `GET /api/public/packages-page-settings` — a singleton. */
export interface PackagesPageSettings {
  title: LocalizedString;
  titleAccent: LocalizedString;
  subtitle: LocalizedString;
  durationLabels: { month: LocalizedString; quarter: LocalizedString; half: LocalizedString };
  subscribeButtonLabel: LocalizedString;
}
