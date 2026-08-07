/**
 * The single source for this app's internal route paths. Internal links
 * should reference these constants rather than repeating literals, so a
 * route rename is one edit here instead of a grep-and-hope.
 *
 * A plain `as const` object rather than an enum: the values need to be
 * usable at runtime (see `appHref` below, which derives dynamic paths from
 * these same strings), and the exported union type keeps the legacy
 * `AppLink`'s `href: AppRoute` prop working unchanged.
 */
export const AppRoute = {
  Home: "/",
  Doctor: "/doctor",
  Packages: "/packages",
  Recipes: "/recipes",
  Reviews: "/reviews",
  Videos: "/videos",
  Faq: "/faq",
  Calculator: "/calculator",
  Consultation: "/consultation",

  /**
   * Express-style templates consumed by the legacy `AppLink`, which
   * substitutes `params`. New code should use `appHref` instead — these
   * disappear with the last legacy page that uses them.
   */
  Recipe: "/recipes/:id",
  Review: "/reviews/:id",
  Video: "/videos/:id",
  /**
   * Campaigns have no listing page — a campaign is only ever reached by
   * its own slug (a homepage banner, or a direct link), matching the CMS
   * model (`GET /api/public/campaigns/[slug]`, no `/api/public/campaigns`
   * list endpoint).
   */
  Campaign: "/campaigns/:slug",
} as const;

export type AppRoute = (typeof AppRoute)[keyof typeof AppRoute];

/**
 * Dynamic route builders, derived from the templates above so a path is
 * still declared in exactly one place. Returns a plain string for
 * `next-intl`'s `Link`, which adds the locale prefix itself.
 */
export const appHref = {
  recipe: (id: string) => AppRoute.Recipe.replace(":id", id),
  review: (id: string) => AppRoute.Review.replace(":id", id),
  video: (id: string) => AppRoute.Video.replace(":id", id),
  campaign: (slug: string) => AppRoute.Campaign.replace(":slug", slug),
} as const;

export default AppRoute;
