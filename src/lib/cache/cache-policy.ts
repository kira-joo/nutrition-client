import { createCachePolicyResolver } from "@kira-joo/frontend-toolkit-core/server";
import { CacheTag } from "@/lib/cache/cache-tags";

/**
 * Cache POLICY — how long each domain's fallback revalidation window is,
 * kept separate from the tag taxonomy (cache-tags.ts) since these are two
 * different concerns: tags identify *what* to invalidate, policy decides
 * *how stale it can get* before on-demand invalidation (a later phase)
 * would have been expected to catch it.
 */
export const DEFAULT_REVALIDATE_SECONDS = 60 * 60 * 24; // 1 day

/** Only the static domain-level tags are valid policy keys — `recipe(id)`/`campaign(slug)` are entity-level and never used for policy lookup (see cache-tags.ts's multi-tag convention). */
type StaticCacheTagValue = Exclude<(typeof CacheTag)[keyof typeof CacheTag], (...args: never[]) => unknown>;

/**
 * Stable CMS content defaults to a one-day fallback — on-demand
 * invalidation (a later phase) is the primary freshness mechanism, so
 * this is genuinely a fallback, not a target staleness window. Campaigns
 * are the one deliberate exception: a campaign's visibility can flip from
 * valid to invalid purely from wall-clock time crossing `endDate`, with
 * zero underlying data change to trigger on-demand invalidation at all —
 * see docs/architecture.md for the full reasoning.
 */
export const CACHE_POLICY: Record<StaticCacheTagValue, number> = {
  [CacheTag.SITE_SETTINGS]: DEFAULT_REVALIDATE_SECONDS,
  [CacheTag.DOCTOR_PROFILE]: DEFAULT_REVALIDATE_SECONDS,
  [CacheTag.PACKAGES_PAGE_SETTINGS]: DEFAULT_REVALIDATE_SECONDS,
  [CacheTag.PACKAGES]: DEFAULT_REVALIDATE_SECONDS,
  [CacheTag.RECIPE_CATEGORIES]: DEFAULT_REVALIDATE_SECONDS,
  [CacheTag.RECIPE_FOOD_GROUPS]: DEFAULT_REVALIDATE_SECONDS,
  [CacheTag.RECIPES]: DEFAULT_REVALIDATE_SECONDS,
  [CacheTag.REVIEWS]: DEFAULT_REVALIDATE_SECONDS,
  [CacheTag.VIDEOS]: DEFAULT_REVALIDATE_SECONDS,
  [CacheTag.FAQ]: DEFAULT_REVALIDATE_SECONDS,
  [CacheTag.CAMPAIGNS]: 300,
};

/**
 * `tags[0]` by convention is the policy tag — see cache-tags.ts. Falls back
 * to `DEFAULT_REVALIDATE_SECONDS` for a tag with no explicit policy entry
 * (e.g. an entity-level-only tag passed first by mistake) rather than
 * throwing. The lookup mechanism itself is frontend-toolkit-core's
 * `createCachePolicyResolver` — generic across any tag/interval shape; only
 * the concrete tags and intervals above are this app's own business
 * decision, and stay local per the explicit decision recorded in
 * docs/architecture.md.
 */
export const resolvePolicyRevalidate = createCachePolicyResolver(
  CACHE_POLICY as Record<string, number>,
  DEFAULT_REVALIDATE_SECONDS
);
