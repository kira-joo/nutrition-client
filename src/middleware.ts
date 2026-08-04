import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

// Replaces the old hand-rolled `/` -> `/ar` rewrite with next-intl's
// routing-aware middleware, driven by the same `routing` config the
// request/navigation helpers use — one source of truth for locale
// behavior instead of a separate hardcoded rewrite.
export default createMiddleware(routing);

export const config = {
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
