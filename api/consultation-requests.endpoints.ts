import { MethodType, type Endpoint } from "@kira-joo/frontend-toolkit-core";
import type { ConsultationRequestResult, CreateConsultationRequestInput } from "../src/lib/domain/consultation-request";

/**
 * This app's OWN proxy route (src/app/api/consultation-requests/route.ts),
 * not nutrition-staff's — the browser never calls nutrition-staff
 * directly. `requester`/`useRequesterMutation` resolve this against
 * `APIConfig.baseURL` (same-origin, configured in
 * src/lib/api/api-config.ts), so `url` is same-origin-relative. This is
 * the one the browser/client components use.
 */
export const createConsultationRequestEndpoint: Endpoint<{
  body: CreateConsultationRequestInput;
  returnType: ConsultationRequestResult;
}> = {
  url: "/api/consultation-requests",
  methodType: MethodType.POST,
};

// nutrition-staff's real upstream endpoint — used only by the proxy route
// handler (src/app/api/consultation-requests/route.ts), which can't import
// anything from this file (or anywhere else that touches
// @kira-joo/frontend-toolkit-core's barrel — see
// consultation-requests.route-paths.ts for why). That plain-string
// constant is the one the route handler actually uses.
