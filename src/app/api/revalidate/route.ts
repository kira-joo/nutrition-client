import "server-only";
import { timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Constant-time comparison against the expected `Bearer <REVALIDATE_SECRET>`
 * header — a plain `===` would leak timing information about how many
 * leading characters matched. `Buffer.from` on two different-length inputs
 * would make `timingSafeEqual` throw, so the length check happens first
 * (this early return is on public information — the two lengths — not the
 * secret itself, so it doesn't reopen the timing side-channel).
 */
function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) return false;

  const header = request.headers.get("authorization") ?? "";
  const expected = `Bearer ${secret}`;
  const headerBuffer = Buffer.from(header);
  const expectedBuffer = Buffer.from(expected);

  return headerBuffer.length === expectedBuffer.length && timingSafeEqual(headerBuffer, expectedBuffer);
}

/**
 * nutrition-staff calls this (via `publishRevalidation`) right after a
 * mutating route there successfully commits a write — the on-demand
 * counterpart to the fallback `revalidate` intervals in cache-policy.ts.
 * Never called from the browser: `REVALIDATE_SECRET` is a server-only env
 * var shared only with nutrition-staff.
 */
export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body: unknown = await request.json().catch(() => null);
  const tags =
    body !== null && typeof body === "object" && Array.isArray((body as { tags?: unknown }).tags)
      ? (body as { tags: unknown[] }).tags.filter((tag): tag is string => typeof tag === "string")
      : [];

  for (const tag of tags) {
    // Next 16 requires a second argument. `{ expire: 0 }` is the literal
    // equivalent of the old single-argument call (Next's own docs: "No
    // second argument (deprecated) — behaves like `{ expire: 0 }`") —
    // immediate invalidation, no stale-while-revalidate window. This
    // route exists for on-demand invalidation right after a write commits,
    // so serving stale content afterward (the `"max"` profile) would be a
    // behavior change, not a like-for-like migration.
    revalidateTag(tag, { expire: 0 });
  }

  return NextResponse.json({ revalidated: true, tags });
}
