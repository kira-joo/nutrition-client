import { classifyApiError, getApiErrorStatusCode, isApiError, type ApiErrorCategory } from "@/lib/api/classify-api-error";
import { normalizeApiError } from "@/lib/api/normalize-api-error";
import type { ApiError } from "@kira-joo/toolkit-common";

/**
 * The one error shape every layer of this app uses — server data
 * functions (src/lib/data/**), the consultation mutation, and (in a later
 * phase) the components that render error/empty states. Nothing upstream
 * of this should throw or pass around a raw `Error`, a fetch `Response`,
 * or a parsed-but-unshaped JSON body.
 *
 * The classify/normalize logic itself is frontend-toolkit-core's, just
 * reimplemented locally in classify-api-error.ts/normalize-api-error.ts —
 * this file is imported by every server data function (transitively, via
 * fetchPublic), and any real value import from
 * @kira-joo/frontend-toolkit-core's barrel crashes Next's page-data-
 * collection build step (confirmed during Phase 4 verification — see
 * those two files' own comments for the full story). This is not a
 * parallel error-handling scheme; it's the same logic, worked around a
 * packaging constraint in the shared dependency.
 */
export interface AppError {
  /** Discriminant, so `isAppError` doesn't have to guess from shape alone (an AppError doesn't structurally resemble the ApiError it's built from — different field names — so duck-typing the two apart would be fragile). */
  readonly __isAppError: true;
  category: ApiErrorCategory;
  message: string;
  statusCode?: number;
  /** Per-field validation messages, when `category === "validation"` — same shape nutrition-staff's createErrorResponse returns. */
  validationErrors?: ApiError["validationErrors"];
  /** The original ApiError, for call sites that need something error-model.ts doesn't surface (rare — prefer the fields above). */
  cause: ApiError;
}

/** Distinguishes an already-normalized `AppError` (thrown by fetchPublic/the consultation mutation) from a raw thrown value that still needs `toAppError`. Never re-run `toAppError` on something this returns true for — see the note on `toAppError` below. */
export function isAppError(error: unknown): error is AppError {
  return typeof error === "object" && error !== null && "__isAppError" in error;
}

/**
 * Normalizes anything caught from a `fetch` (server reads) or a
 * `requester`/`useRequesterMutation` call (client mutations) into one
 * `AppError` shape. Safe to call on a raw thrown value or an `ApiError`.
 *
 * NOT safe to call on an `AppError` that's already been through this
 * function once (e.g. re-catching what `fetchPublic` threw) — `AppError`
 * doesn't structurally resemble the `ApiError` this reads fields off of,
 * so re-running it would silently produce a wrong, generic result instead
 * of erroring loudly. Check `isAppError(error)` first; if true, use it
 * directly, don't pass it back through `toAppError`.
 *
 * `response` is the failed `fetch` Response, when there is one (native
 * `fetch` call sites) — omit it for errors that never reached the network
 * (e.g. a thrown validation error before the request).
 */
export async function toAppError(error: unknown, response?: Response): Promise<AppError> {
  const apiError = isApiError(error) ? error : await normalizeApiError(error, response);
  return {
    __isAppError: true,
    category: classifyApiError(apiError),
    message: apiError.message,
    statusCode: getApiErrorStatusCode(apiError) ?? apiError.statusCode,
    validationErrors: apiError.validationErrors,
    cause: apiError,
  };
}

/** True specifically for "the resource doesn't exist" — the one category server data functions treat as `notFound()`, not a rendered error state. */
export function isNotFoundError(error: AppError): boolean {
  return error.category === "notFound";
}

/**
 * The one place the "404 becomes null, everything else rethrows" pattern
 * lives — every detail-fetch data function (getRecipe, getCampaign, ...)
 * uses this instead of repeating its own try/catch. Deliberately returns
 * `null`, never calls Next's `notFound()` itself: a data function isn't
 * the right layer to make a navigation decision — the calling page
 * decides whether `null` means `notFound()`, an empty state, or something
 * else entirely.
 */
export async function nullableOnNotFound<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    if (isAppError(error) && isNotFoundError(error)) return null;
    throw error;
  }
}
