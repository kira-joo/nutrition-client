import { MethodType, type Endpoint } from "@kira-joo/frontend-toolkit-core";
import { PublicApiRoute } from "./public-api-route";
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
  url: PublicApiRoute.CONSULTATION_REQUESTS,
  methodType: MethodType.POST,
};
