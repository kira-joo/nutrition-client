/**
 * Wraps a single data source so its failure can't take down an entire
 * multi-source page composition — e.g. the homepage renders packages,
 * reviews, and FAQ independently; a reviews-fetch failure must never blank
 * out packages or FAQ. Returns `null` on any thrown error (already-typed
 * `AppError` or otherwise); the calling section is expected to render
 * nothing (or its own empty state) when it receives `null`, never to
 * distinguish "empty" from "failed" — a data function's caller doesn't
 * need that distinction to decide what to show.
 */
export async function safe<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn();
  } catch {
    return null;
  }
}
