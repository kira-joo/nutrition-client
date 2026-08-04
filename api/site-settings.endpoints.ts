import { MethodType, type Endpoint } from "@kira-joo/frontend-toolkit-core/server";
import { PublicApiRoute } from "./public-api-route";
import type { SiteSettings } from "../src/lib/domain/site-settings";

// Same api/<domain>.endpoints.ts convention as nutrition-staff's own
// frontend (see nutrition-staff/api/site-settings.endpoints.ts) — one
// named endpoint constant per operation, never a bare path string at the
// call site (routes live in public-api-route.ts). Uses
// frontend-toolkit-core's `./server` entry point — the server-safe
// subpath, importable from any server-side code (fetchPublic, Server
// Components, Route Handlers) without the root barrel's React-context
// build crash. See docs/architecture.md ("Public data flow") for the full
// story.

export const getSiteSettingsEndpoint: Endpoint<{ returnType: SiteSettings }> = {
  url: PublicApiRoute.SITE_SETTINGS,
  methodType: MethodType.GET,
};
