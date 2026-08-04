/**
 * Local reimplementation of frontend-toolkit-core's `buildUrl`/
 * `buildQueryString` (verified byte-for-byte against its compiled
 * output) — NOT a stylistic duplication. `fetchPublic` is imported by
 * every Server Component page that reads CMS data, and confirmed during
 * Phase 4 verification: importing even a single real (non-type) binding
 * from `@kira-joo/frontend-toolkit-core`'s barrel — including this exact
 * function — crashes Next's "Collecting page data" build step with
 * `TypeError: createContext is not a function`, for BOTH Route Handlers
 * and ordinary Server Component pages (the barrel calls `createContext()`
 * at module top level for `AuthUserContext`/`QueryParamsRouterContext`,
 * unconditionally, the moment any export is imported — this isn't
 * evaluable in whatever constrained environment that build step runs in).
 * `type`-only imports from the same package (`Endpoint`, `EndpointParams`,
 * etc., used throughout src/lib and api/*.endpoints.ts) are fully erased
 * by the compiler and carry none of this risk — only real value imports
 * do. This is the one real value import `fetchPublic` needed, so it's
 * reimplemented here instead.
 *
 * Placeholder syntax is `:param` (matching frontend-toolkit-core's own
 * convention), not `[param]` — every `api/*.endpoints.ts` URL uses `:id`/
 * `:slug` accordingly.
 */
function buildQueryString(query?: Record<string, unknown>): string {
  if (!query) return "";
  const parts: string[] = [];
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue;
    const encodedKey = encodeURIComponent(key);
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item === undefined || item === null) continue;
        parts.push(`${encodedKey}=${encodeURIComponent(String(item))}`);
      }
      continue;
    }
    parts.push(`${encodedKey}=${encodeURIComponent(String(value))}`);
  }
  return parts.join("&");
}

export function buildUrl(url: string, params?: Record<string, unknown>, query?: Record<string, unknown>): string {
  let resolvedUrl = url;
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null) continue;
      resolvedUrl = resolvedUrl.replace(`:${key}`, encodeURIComponent(String(value)));
    }
  }
  const queryString = buildQueryString(query);
  return queryString ? `${resolvedUrl}?${queryString}` : resolvedUrl;
}
