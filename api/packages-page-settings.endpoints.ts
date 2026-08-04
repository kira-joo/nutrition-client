import { MethodType, type Endpoint } from "@kira-joo/frontend-toolkit-core/server";
import { PublicApiRoute } from "./public-api-route";
import type { PackagesPageSettings } from "../src/lib/domain/packages-page-settings";

export const getPackagesPageSettingsEndpoint: Endpoint<{ returnType: PackagesPageSettings }> = {
  url: PublicApiRoute.PACKAGES_PAGE_SETTINGS,
  methodType: MethodType.GET,
};
