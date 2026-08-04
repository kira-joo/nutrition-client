import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { UPSTREAM_CONSULTATION_REQUESTS_PATH } from "../../../../api/consultation-requests.route-paths";
import { ServerApiConfig } from "@/lib/api/server-api-config";

export const dynamic = "force-dynamic";

/**
 * The browser's only path to nutrition-staff's lead-capture endpoint —
 * every consultation/contact/package-inquiry form on this site posts
 * here, never to nutrition-staff directly. This keeps nutrition-staff's
 * origin off the public internet's CORS surface entirely (it has no CORS
 * support today) and means the browser never needs to know
 * `STAFF_API_BASE_URL` exists. A thin pass-through: forward the body,
 * forward the response (success or error) verbatim, add nothing.
 *
 * Imports `UPSTREAM_CONSULTATION_REQUESTS_PATH` and `ServerApiConfig`
 * specifically (not the typed `Endpoint` object from
 * consultation-requests.endpoints.ts, and not `MethodType`/`ContentType`)
 * — anything importing @kira-joo/frontend-toolkit-core's barrel breaks
 * this route's build; see consultation-requests.route-paths.ts for the
 * full story. The raw `"POST"`/`"content-type": "application/json"`
 * strings below are that same documented exception, not an oversight.
 */
export async function POST(request: NextRequest) {
  let baseUrl: string;
  try {
    baseUrl = ServerApiConfig.baseURL;
  } catch {
    return NextResponse.json({ statusCode: 500, message: "Server misconfigured", error: "SERVER_ERROR" }, { status: 500 });
  }

  const body = await request.text();
  const url = new URL(UPSTREAM_CONSULTATION_REQUESTS_PATH, baseUrl);

  const upstreamResponse = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
    cache: "no-store",
  });

  const responseBody = await upstreamResponse.text();
  return new NextResponse(responseBody, {
    status: upstreamResponse.status,
    headers: { "content-type": "application/json" },
  });
}
