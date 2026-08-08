/**
 * The single source for this app's internal route paths. Internal links
 * should reference these constants rather than repeating literals, so a
 * route rename is one edit here instead of a grep-and-hope.
 *
 * A plain `as const` object rather than an enum: the values need to be
 * usable at runtime (see `appHref` below, which derives dynamic paths from
 * these same strings).
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
   * Express-style templates for the dynamic routes, substituted by the
   * `appHref` builders below. Only routes that actually exist belong here:
   * reviews and videos are list-plus-lightbox surfaces with no detail page
   * (the CMS exposes no single-review/single-video endpoint), so they have
   * no template.
   */
  Recipe: "/recipes/:id",
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
  campaign: (slug: string) => AppRoute.Campaign.replace(":slug", slug),
} as const;

export default AppRoute;
