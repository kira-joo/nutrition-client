import { getPackagesPageSettingsEndpoint } from "../../../api/packages-page-settings.endpoints";
import { fetchPublic } from "@/lib/api/fetch-public";
import { CacheTag } from "@/lib/cache/cache-tags";
import type { PackagesPageSettings } from "@/lib/domain/packages-page-settings";

export async function getPackagesPageSettings(): Promise<PackagesPageSettings> {
  return fetchPublic(getPackagesPageSettingsEndpoint, { tags: [CacheTag.PACKAGES_PAGE_SETTINGS] });
}
