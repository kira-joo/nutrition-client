import type { PublicEndpoint } from "../src/lib/api/public-endpoint.type";
import type { SiteSettings } from "../src/lib/domain/site-settings";

// Same api/<domain>.endpoints.ts convention as nutrition-staff's own
// frontend (see nutrition-staff/api/site-settings.endpoints.ts) — one
// named endpoint constant per operation, never a bare path string at the
// call site. Uses the local `PublicEndpoint` type (not
// frontend-toolkit-core's `Endpoint`) — see public-endpoint.type.ts for
// why: this is a read-only endpoint consumed only by `fetchPublic`, and
// importing frontend-toolkit-core's real `MethodType` enum here would
// break Next's page-data-collection build step for every page that
// transitively imports it.

export const getSiteSettingsEndpoint: PublicEndpoint<{ returnType: SiteSettings }> = {
  url: "/api/public/site-settings",
};
