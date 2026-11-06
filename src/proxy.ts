import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "@/i18n/routing";

const intlMiddleware = createMiddleware(routing);

/** `/en/books` and every path under it (e.g. `/en/books/some-slug`) — Books is Arabic-only, so the English variant never renders; it always redirects to the exact matching Arabic path instead of a misleading 404. Slug and query string are preserved. */
const ARABIC_ONLY_EN_PREFIX = "/en/books";

/** The standalone lectures surface has its own root layout outside `[locale]` (see `src/app/lectures/layout.tsx`) — the locale middleware must not redirect it to `/ar/lectures`, which does not exist. */
const STANDALONE_PREFIX = "/lectures";

export default function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (pathname === STANDALONE_PREFIX || pathname.startsWith(`${STANDALONE_PREFIX}/`)) {
    return NextResponse.next();
  }

  if (pathname === ARABIC_ONLY_EN_PREFIX || pathname.startsWith(`${ARABIC_ONLY_EN_PREFIX}/`)) {
    const arabicPath = `/ar${pathname.slice("/en".length)}`;
    return NextResponse.redirect(new URL(`${arabicPath}${search}`, request.url), 308);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
