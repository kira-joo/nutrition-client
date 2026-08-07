// Resources was removed — no locale JSON file ever backed it and no call
// site ever requested it; see docs/architecture.md ("Localization & RTL").
// Videos got its own dedicated namespace once the real /videos rebuild
// needed copy the Home namespace didn't carry (empty states, per-card
// affordance labels, pagination) — it no longer borrows Home's strings.
// Reviews followed the same path for its own rebuild (before/after labels,
// source-link copy, empty state) — it no longer borrows Home's strings either.
export enum DictionaryFiles {
  Home = "home",
  SendMessage = "send-message",
  Recipes = "recipes",
  Faq = "faq",
  Calculator = "calculator",
  Packages = "packages",
  _15DayCamp = "15-day-camp",
  /** Global application shell copy (nav, footer, shared CTAs) — Phase 6. */
  Layout = "layout",
  Videos = "videos",
  Reviews = "reviews",
}
