import "server-only";

/**
 * The server-side counterpart to `api-config.ts`'s `configureApiClient()`
 * — same "configure once, every caller reads the same config object"
 * shape as frontend-toolkit-core's `APIConfig`, deliberately NOT the same
 * class instance. `APIConfig.baseURL` is a static, process-wide mutable
 * field the CLIENT path sets to `""` (same-origin, for the browser's
 * proxy calls) — Next.js's server runtime is one shared Node process
 * across concurrent requests, so if a server-side read also pointed
 * `APIConfig.baseURL` at nutrition-staff's origin, the two would
 * overwrite each other's intent in that shared process. Two small config
 * objects, one per execution context, is what keeps that from happening;
 * merging them isn't a simplification, it's a real bug waiting for the
 * two contexts to run in the same process (which they routinely do, since
 * Next.js evaluates "use client" modules server-side too during SSR).
 *
 * `fetchPublic` is the only intended reader — every server-side read of
 * nutrition-staff's public API resolves its base URL from here, not by
 * calling `process.env.STAFF_API_BASE_URL` itself.
 */
class ServerApiConfigClass {
  private resolvedBaseURL: string | null = null;

  /**
   * Lazily resolved (not read at module-import time) — this module can be
   * pulled into the build graph (e.g. Next's page-data collection) in an
   * environment where `STAFF_API_BASE_URL` genuinely isn't set until
   * runtime (common on platforms that inject secrets only at request
   * time), so validating eagerly would risk failing `next build` itself
   * rather than the request that actually needs the value.
   */
  get baseURL(): string {
    if (this.resolvedBaseURL === null) {
      const value = process.env.STAFF_API_BASE_URL;
      if (!value) {
        throw new Error("STAFF_API_BASE_URL is not set — see .env.example.");
      }
      this.resolvedBaseURL = value;
    }
    return this.resolvedBaseURL;
  }
}

export const ServerApiConfig = new ServerApiConfigClass();
