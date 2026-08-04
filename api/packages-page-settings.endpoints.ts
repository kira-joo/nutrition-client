import type { PublicEndpoint } from "../src/lib/api/public-endpoint.type";
import type { PackagesPageSettings } from "../src/lib/domain/packages-page-settings";

export const getPackagesPageSettingsEndpoint: PublicEndpoint<{ returnType: PackagesPageSettings }> = {
  url: "/api/public/packages-page-settings",
};
