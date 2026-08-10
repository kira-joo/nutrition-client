/**
 * The public site's own origin — needed for `metadataBase` (so every
 * relative URL in a route's `generateMetadata`, e.g. an Open Graph image
 * path, resolves against the real site root instead of the current
 * request's path) and for canonical URLs / `alternates.languages`.
 *
 * This is a genuinely deployment-dependent value (localhost in dev, the
 * real domain once launched) — unlike `APP_TIMEZONE`, which is a fixed
 * business fact, this has to come from the environment. Reads
 * `NEXT_PUBLIC_SITE_URL` (set it in the deployment environment once the
 * site has a real domain); falls back to a local dev URL so
 * `next dev`/`next build` never fail for lack of it before launch.
 *
 * `NEXT_PUBLIC_`-prefixed (not a server-only var) since a canonical/share
 * URL is legitimate to construct client-side too (e.g. a future "copy
 * link" action), not just inside `generateMetadata`.
 */
export const SITE_ORIGIN = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const siteMetadataBase = new URL(SITE_ORIGIN);
