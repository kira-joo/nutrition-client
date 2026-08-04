import "server-only";
import { buildUrl, joinUrl, toAppError, type Endpoint, type EndpointParams, type EndpointQuery, type EndpointReturn } from "@kira-joo/frontend-toolkit-core/server";
import { ServerApiConfig } from "@/lib/api/server-api-config";
import { resolvePolicyRevalidate } from "@/lib/cache/cache-policy";

interface FetchPublicOptions<TEndpoint extends Endpoint> {
  params?: EndpointParams<TEndpoint>;
  query?: EndpointQuery<TEndpoint>;
  /** Cache tag(s) for this call — see src/lib/cache/cache-tags.ts. `tags[0]` is the policy tag (drives the revalidate default) by convention; any further tags are entity-level, invalidation-only. */
  tags: string[];
  /** Explicit override — priority over the tag-derived policy. Ordinary CMS reads shouldn't need this; see src/lib/cache/cache-policy.ts. */
  revalidate?: number;
}

/**
 * The one place every server-side read of nutrition-staff's public API
 * goes through. Takes the same `Endpoint` object defined under
 * `api/*.endpoints.ts` — never a bare path string at a call site — and
 * infers its return type from the endpoint definition, so call sites don't
 * repeat a generic.
 *
 * Revalidation is derived from `tags[0]` via cache-policy.ts unless the
 * caller passes an explicit `revalidate` — ordinary data functions only
 * need to supply `tags`, per docs/architecture.md ("Public data flow").
 *
 * Deliberately native `fetch`, not frontend-toolkit-core's `requester` —
 * `requester` has no passthrough for Next's `cache`/`next: {revalidate,
 * tags}` fetch options, so it can't participate in the Data Cache at all,
 * and its `APIConfig` is a process-wide static that the client path
 * already uses with a different intended value (see
 * server-api-config.ts). `requester` stays reserved for genuinely
 * client-side calls (the consultation mutation).
 *
 * `import "server-only"` makes it a build error to accidentally import
 * this from a client component — the base URL comes from
 * `ServerApiConfig` (server-api-config.ts), itself sourced from
 * `API_URL` (which owns nutrition-staff's shared `/api`
 * prefix — see api/public-api-route.ts), a server-only env var with no
 * `NEXT_PUBLIC_` prefix, specifically so the browser can never be pointed
 * at nutrition-staff directly. Joined with `joinUrl`, not `new URL(path,
 * base)` — the latter would silently drop `API_URL`'s `/api`
 * segment, since URL resolution treats an absolute `path` as replacing
 * the base's own path rather than appending to it.
 */
export async function fetchPublic<TEndpoint extends Endpoint>(
  endpoint: TEndpoint,
  { params, query, tags, revalidate }: FetchPublicOptions<TEndpoint>
): Promise<EndpointReturn<TEndpoint>> {
  const path = buildUrl(endpoint.url, params, query);
  const resolvedRevalidate = revalidate ?? resolvePolicyRevalidate(tags);
  const url = joinUrl(ServerApiConfig.baseURL, path);
  const response = await fetch(url, {
    next: { revalidate: resolvedRevalidate, tags },
  });

  if (!response.ok) {
    // `null`, not `new Error(...)` — `toAppError`/`isApiError`'s check is
    // "does this object have a .message property", which a plain Error
    // instance satisfies, causing toAppError to treat it as an
    // already-normalized ApiError and skip parsing `response` entirely
    // (a real bug caught during Phase 4 verification: a genuine 404 was
    // misclassified as "network" this way). `normalizeApiError` never
    // reads its first argument once a `response` is provided, so `null`
    // is exactly as good as any other placeholder and can't false-positive.
    throw await toAppError(null, response);
  }

  return response.json() as Promise<EndpointReturn<TEndpoint>>;
}
