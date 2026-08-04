/**
 * Plain string constant, deliberately NOT an `Endpoint<TSchema>` object —
 * this file must have zero dependency on `@kira-joo/frontend-toolkit-core`.
 * That package's barrel export calls React's `createContext()` at module
 * top-level (for `AuthUserContext`/`QueryParamsRouterContext`), which runs
 * unconditionally the moment ANY named export is imported — fine in a
 * Server Component's React runtime, but a real build failure in a Next.js
 * Route Handler's bundle target (confirmed during Phase 4 verification:
 * "TypeError: (0, p.createContext) is not a function" when building
 * src/app/api/consultation-requests/route.ts). Server Components/Client
 * Components safely use the full typed `Endpoint` objects in
 * consultation-requests.endpoints.ts; Route Handlers use this instead.
 */
export const UPSTREAM_CONSULTATION_REQUESTS_PATH = "/api/public/consultation-requests";
