import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { ContentType, joinUrl, MethodType } from "@kira-joo/frontend-toolkit-core/server";
import { PublicApiRoute } from "../../../../api/public-api-route";
import { ServerApiConfig } from "@/lib/api/server-api-config";

export const dynamic = "force-dynamic";

/**
 * The browser's only path to nutrition-staff's lead-capture endpoint —
 * every consultation/contact/package-inquiry form on this site posts
 * here, never to nutrition-staff directly. This keeps nutrition-staff's
 * origin off the public internet's CORS surface entirely (it has no CORS
 * support today) and means the browser never needs to know
 * `API_URL` exists. A thin pass-through: forward the body,
 * forward the response (success or error) verbatim, add nothing.
 *
 * Joined via `joinUrl`, not `new URL(path, base)` — see fetch-public.ts's
 * doc comment for why the latter would silently drop
 * `API_URL`'s `/api` prefix.
 */
export async function POST(request: NextRequest) {
  let baseUrl: string;
  try {
    baseUrl = ServerApiConfig.baseURL;
  } catch {
    return NextResponse.json({ statusCode: 500, message: "Server misconfigured", error: "SERVER_ERROR" }, { status: 500 });
  }

  const body = await request.text();
  const url = joinUrl(baseUrl, PublicApiRoute.CONSULTATION_REQUESTS_UPSTREAM);

  const upstreamResponse = await fetch(url, {
    method: MethodType.POST,
    headers: { "content-type": ContentType.JSON },
    body,
    cache: "no-store",
  });

  const responseBody = await upstreamResponse.text();
  return new NextResponse(responseBody, {
    status: upstreamResponse.status,
    headers: { "content-type": ContentType.JSON },
  });
}
