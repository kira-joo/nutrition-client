import "server-only";
import { createLazyEnvBaseUrlConfig } from "@kira-joo/frontend-toolkit-core/server";

/**
 * The server-side counterpart to `api-config.ts`'s `configureApiClient()`
 * — same "configure once, every caller reads the same config object"
 * shape as frontend-toolkit-core's `APIConfig`, deliberately NOT the same
 * class instance. `APIConfig.baseURL` is a static, process-wide mutable
 * field the CLIENT path sets to `"/api"` (same-origin, for the browser's
 * own proxy routes) — Next.js's server runtime is one shared Node process
 * across concurrent requests, so if a server-side read also pointed
 * `APIConfig.baseURL` at nutrition-staff's origin, the two would
 * overwrite each other's intent in that shared process. Two small config
 * objects, one per execution context, is what keeps that from happening;
 * merging them isn't a simplification, it's a real bug waiting for the
 * two contexts to run in the same process (which they routinely do, since
 * Next.js evaluates "use client" modules server-side too during SSR).
 *
 * `API_URL` owns nutrition-staff's shared `/api` prefix (e.g.
 * `"https://staff.example.com/api"`) — route constants in
 * `api/public-api-route.ts` are resource paths only. `fetchPublic` joins
 * the two via frontend-toolkit-core's `joinUrl`, not `new URL(path, base)`
 * (see fetch-public.ts's doc comment for why that would silently drop
 * this prefix). `fetchPublic` is the only intended reader — every
 * server-side read of nutrition-staff's public API resolves its base URL
 * from here, not by calling `process.env.API_URL` itself.
 *
 * The lazy-resolution mechanism itself (read on first access, not at
 * module-import/build time, so a build environment where the variable is
 * only injected at request time doesn't fail `next build` itself) is
 * frontend-toolkit-core's `createLazyEnvBaseUrlConfig` — this app has one
 * upstream backend, so it uses the helper's zero-argument default
 * (`API_URL`, hinting at `.env.example`) rather than overriding it.
 */
export const ServerApiConfig = createLazyEnvBaseUrlConfig();
