// Resources and 15-day-camp were removed — no locale JSON file ever backed
// Resources and no call site ever requested it; 15-day-camp's own JSON was
// deleted along with the page once it was replaced by the generic
// CMS-driven /campaigns/[slug] system (Phase 6.7) — see docs/architecture.md
// ("Localization & RTL").
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
  /** Global application shell copy (nav, footer, shared CTAs) — Phase 6. */
  Layout = "layout",
  Videos = "videos",
  Reviews = "reviews",
  Campaigns = "campaigns",
}
