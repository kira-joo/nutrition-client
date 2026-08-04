import type { ApiError } from "@kira-joo/toolkit-common";

/**
 * Local reimplementation of frontend-toolkit-core's `normalizeApiError`
 * (verified byte-for-byte against its compiled output) — same reason as
 * build-url.ts: this is a real (non-type) value import, and any value
 * import from `@kira-joo/frontend-toolkit-core`'s barrel crashes Next's
 * "Collecting page data" build step for both Route Handlers and Server
 * Component pages (confirmed during Phase 4 verification). `ApiError`
 * itself is imported `type`-only from `@kira-joo/toolkit-common` — a
 * separate, zero-runtime-dependency package with no such issue.
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function extractMessage(body: unknown, fallback: string): string {
  if (isRecord(body) && typeof body.message === "string") return body.message;
  if (typeof body === "string" && body.length > 0) return body;
  return fallback;
}

function extractError(body: unknown): string | undefined {
  return isRecord(body) && typeof body.error === "string" ? body.error : undefined;
}

function extractValidationErrors(body: unknown): ApiError["validationErrors"] {
  if (!isRecord(body)) return undefined;
  const validationErrors = body.validationErrors ?? body.errors;
  return Array.isArray(validationErrors) ? validationErrors : undefined;
}

export async function normalizeApiError(error: unknown, response?: Response): Promise<ApiError> {
  if (!response) {
    const message = error instanceof Error && error.message ? error.message : "Network error";
    return { message, raw: error };
  }

  let body: unknown;
  try {
    body = await response.clone().json();
  } catch {
    try {
      body = await response.clone().text();
    } catch {
      body = undefined;
    }
  }

  return {
    statusCode: response.status,
    message: extractMessage(body, response.statusText || "Request failed"),
    error: extractError(body),
    validationErrors: extractValidationErrors(body),
    raw: body,
  };
}
