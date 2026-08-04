import type { PublicEndpoint } from "../src/lib/api/public-endpoint.type";
import type { Package } from "../src/lib/domain/package";

/** No pagination — a small, fixed-size collection by design (see nutrition-staff's PackageSchema comment). */
export const getPackagesEndpoint: PublicEndpoint<{ returnType: Package[] }> = {
  url: "/api/public/packages",
};
