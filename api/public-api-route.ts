/**
 * Every route this app's `api/*.endpoints.ts` files and Route Handlers
 * point at, in one place — no `url`/`fetch` call site anywhere in the
 * project hardcodes an API path string literal directly; they all read
 * from here instead. Plain string constants, zero dependency on
 * `@kira-joo/frontend-toolkit-core` (even the safe `./server` subpath) —
 * this file is always safe to import from anywhere, including the Route
 * Handler that used to need a separate toolkit-free file for exactly that
 * reason.
 *
 * These are RESOURCE paths only — the common `/api` prefix lives on the
 * base URL, not here:
 * - `ServerApiConfig.baseURL` (`API_URL`, e.g.
 *   `"https://staff.example.com/api"`) owns nutrition-staff's `/api`
 *   prefix. `fetchPublic` and the consultation proxy Route Handler join it
 *   with the `PUBLIC_*`/`CONSULTATION_REQUESTS_UPSTREAM` paths below via
 *   `joinUrl` (frontend-toolkit-core) — never `new URL(path, base)`, whose
 *   absolute-path resolution would silently drop the base's own `/api`
 *   segment.
 * - `APIConfig.baseURL` (same-origin, configured to `"/api"` in
 *   `api-config.ts`) owns this app's own `/api` prefix. The client-side
 *   consultation mutation hook joins it with `CONSULTATION_REQUESTS` the
 *   same way, via `requester`'s own internal `joinUrl` use.
 *
 * One rule either way: a base URL owns the shared prefix, a route constant
 * owns only the resource path — never both, never neither.
 */
export const PublicApiRoute = {
  SITE_SETTINGS: "/public/site-settings",
  DOCTOR_PROFILE: "/public/doctor-profile",
  PACKAGES_PAGE_SETTINGS: "/public/packages-page-settings",
  PACKAGES: "/public/packages",
  RECIPE_CATEGORIES: "/public/recipe-categories",
  RECIPE_FOOD_GROUPS: "/public/recipe-food-groups",
  RECIPES: "/public/recipes",
  /** `:id` placeholder, not `[id]` — matches frontend-toolkit-core's `buildUrl` substitution convention. */
  RECIPE_DETAIL: "/public/recipes/:id",
  REVIEWS: "/public/reviews",
  VIDEOS: "/public/videos",
  /** `:id` placeholder — see RECIPE_DETAIL. */
  VIDEO_DETAIL: "/public/videos/:id",
  /** Sections+items already joined, ordered, and published-filtered server-side — see docs/architecture.md ("Public data flow"). */
  FAQ: "/public/faq",
  /** `:slug` placeholder — see RECIPE_DETAIL. */
  CAMPAIGN_DETAIL: "/public/campaigns/:slug",
  /** Detail only — nutrition-staff's Books listing is Phase I, not consumed yet. Never requires `visibility: PUBLIC`, so an UNLISTED book resolves here by direct slug while staying out of any future listing. */
  BOOK_DETAIL: "/public/books/:slug",
  /** nutrition-staff's route — called only by this app's own `/api/books/:slug/pdf` proxy Route Handler, never from the browser (same shape as CONSULTATION_REQUESTS_UPSTREAM). */
  BOOK_PDF_UPSTREAM: "/public/books/:slug/pdf",
  /** Resolves `SiteSettings.activeCampaignId` server-side into the same public `Campaign` shape as CAMPAIGN_DETAIL — 404 if unset or not currently published/in-range. The client never resolves this id itself. */
  ACTIVE_CAMPAIGN: "/public/active-campaign",
  /** nutrition-staff's route — called only by this app's own consultation-requests proxy Route Handler, never from the browser. */
  CONSULTATION_REQUESTS_UPSTREAM: "/public/consultation-requests",
  /** This app's OWN route — called by the client-side consultation mutation hook. */
  CONSULTATION_REQUESTS: "/consultation-requests",
} as const;
