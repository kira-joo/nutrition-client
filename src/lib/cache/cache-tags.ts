/**
 * Cache tag taxonomy — stable identifiers, deliberately kept separate from
 * cache POLICY (see cache-policy.ts). These are nutrition-client's own
 * project-specific business contract, not generic toolkit material —
 * nutrition-staff owns its own copy of the matching string values for the
 * revalidation trigger it sends this app in a later phase. They're
 * intentionally kept as two separate project-level definitions rather
 * than a shared package: the toolkit packages stay reusable across
 * unrelated projects and must not carry nutrition-domain knowledge
 * (doctor profiles, recipes, campaigns, ...).
 *
 * Convention for multi-tag fetches: the FIRST tag in a `tags` array is
 * always the domain-level tag (used by cache-policy.ts to look up the
 * revalidation interval); any further tags are entity-level and
 * participate in invalidation only, never in policy lookup — e.g.
 * `[CacheTag.RECIPES, CacheTag.recipe(id)]`.
 */
export const CacheTag = {
  SITE_SETTINGS: "site-settings",
  DOCTOR_PROFILE: "doctor-profile",
  PACKAGES_PAGE_SETTINGS: "packages-page-settings",
  PACKAGES: "packages",
  RECIPE_CATEGORIES: "recipe-categories",
  RECIPE_FOOD_GROUPS: "recipe-food-groups",
  RECIPES: "recipes",
  recipe: (id: string) => `recipe:${id}`,
  REVIEWS: "reviews",
  VIDEOS: "videos",
  video: (id: string) => `video:${id}`,
  FAQ: "faq",
  CAMPAIGNS: "campaigns",
  campaign: (slug: string) => `campaign:${slug}`,
} as const;
