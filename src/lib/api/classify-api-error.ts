import type { ApiError } from "@kira-joo/toolkit-common";

/**
 * Local reimplementation of frontend-toolkit-core's `classifyApiError`/
 * `isApiError`/`getApiErrorStatusCode` (verified against its compiled
 * output) — same barrel-import constraint as normalize-api-error.ts and
 * build-url.ts.
 */
export type ApiErrorCategory = "unauthorized" | "forbidden" | "notFound" | "conflict" | "validation" | "server" | "network";

/**
 * Loose by design (matches frontend-toolkit-core's own check exactly):
 * true for anything with a `.message` property, which a plain `Error`
 * instance also satisfies. That's a real footgun for callers — passing a
 * plain `Error` into `toAppError` gets treated as an already-normalized
 * `ApiError` and skips `normalizeApiError` entirely (caught during Phase
 * 4 verification: `fetch-public.ts` used to construct a throwaway `Error`
 * for this, and a genuine 404 came out classified as `"network"`). Only
 * call this on a value you're confident is either a real `ApiError` or
 * something that's definitely not one (`null`, a plain non-Error object).
 */
export function isApiError(error: unknown): error is ApiError {
  return typeof error === "object" && error !== null && "message" in error;
}

export function getApiErrorStatusCode(error: unknown): number | undefined {
  return isApiError(error) ? error.statusCode : undefined;
}

export function classifyApiError(error: unknown): ApiErrorCategory {
  const statusCode = getApiErrorStatusCode(error);
  if (statusCode === undefined) return "network";
  switch (statusCode) {
    case 401:
      return "unauthorized";
    case 403:
      return "forbidden";
    case 404:
      return "notFound";
    case 409:
      return "conflict";
    case 400:
    case 422:
      return "validation";
    default:
      return "server";
  }
}
