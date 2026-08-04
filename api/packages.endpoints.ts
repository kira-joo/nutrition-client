import { MethodType, type Endpoint } from "@kira-joo/frontend-toolkit-core/server";
import { PublicApiRoute } from "./public-api-route";
import type { Package } from "../src/lib/domain/package";

/** No pagination — a small, fixed-size collection by design (see nutrition-staff's PackageSchema comment). */
export const getPackagesEndpoint: Endpoint<{ returnType: Package[] }> = {
  url: PublicApiRoute.PACKAGES,
  methodType: MethodType.GET,
};
