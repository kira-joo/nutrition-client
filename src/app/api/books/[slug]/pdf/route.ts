import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { joinUrl, MethodType } from "@kira-joo/frontend-toolkit-core/server";
import { PublicApiRoute } from "../../../../../../api/public-api-route";
import { ServerApiConfig } from "@/lib/api/server-api-config";

export const dynamic = "force-dynamic";

/**
 * The browser's only path to a book's PDF bytes — same reasoning as
 * `/api/consultation-requests`: nutrition-staff's origin stays off the
 * public internet's CORS/direct-access surface entirely, and the
 * storage URL nutrition-staff's own public route resolves internally
 * never reaches the browser at any point (this route only ever forwards
 * already-rendered PDF bytes, never a URL). A thin pass-through: no
 * auth, no PDF generation triggered here — nutrition-staff's public PDF
 * route already enforces `allowPdfDownload` + a READY artifact and 404s
 * on its own if either isn't true, so this route's status code IS
 * nutrition-staff's, forwarded verbatim.
 */
export async function GET(request: NextRequest, context: { params: { slug: string } }) {
  let baseUrl: string;
  try {
    baseUrl = ServerApiConfig.baseURL;
  } catch {
    return NextResponse.json({ statusCode: 500, message: "Server misconfigured", error: "SERVER_ERROR" }, { status: 500 });
  }

  const upstreamUrl = joinUrl(baseUrl, PublicApiRoute.BOOK_PDF_UPSTREAM.replace(":slug", context.params.slug));

  const upstreamResponse = await fetch(upstreamUrl, { method: MethodType.GET, cache: "no-store" });

  if (!upstreamResponse.ok) {
    const errorBody = await upstreamResponse.text();
    return new NextResponse(errorBody, {
      status: upstreamResponse.status,
      headers: { "content-type": upstreamResponse.headers.get("content-type") ?? "application/json" },
    });
  }

  const pdfBytes = await upstreamResponse.arrayBuffer();
  return new NextResponse(pdfBytes, {
    status: 200,
    headers: {
      "content-type": upstreamResponse.headers.get("content-type") ?? "application/pdf",
      "content-disposition": upstreamResponse.headers.get("content-disposition") ?? "attachment",
    },
  });
}
