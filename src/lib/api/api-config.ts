import { APIConfig, ContentType } from "@kira-joo/frontend-toolkit-core";

/**
 * Configures `requester`/`useRequesterMutation` (frontend-toolkit-core) for
 * CLIENT-SIDE calls only — the consultation-request mutation, and any
 * future client-side interactive calls (recipe filter refetch, etc. in a
 * later phase). Server-side reads never go through `requester` at all; see
 * src/lib/api/fetch-public.ts and docs/architecture.md ("Public data
 * flow") for why.
 *
 * `baseURL` is same-origin, `"/api"` — the browser only ever calls this
 * app's own `/api/*` proxy routes, never nutrition-staff directly. Owns
 * the shared `/api` prefix so route constants (`PublicApiRoute` in
 * api/public-api-route.ts) only need to name the resource path, e.g.
 * `CONSULTATION_REQUESTS: "/consultation-requests"`. Call this once, e.g.
 * from src/app/providers.tsx, before any `requester` call.
 */
export function configureApiClient() {
  APIConfig.baseURL = "/api";
  APIConfig.defaultHeaders = { "Content-Type": ContentType.JSON };
}
