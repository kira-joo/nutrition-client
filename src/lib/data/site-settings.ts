import { getSiteSettingsEndpoint } from "../../../api/site-settings.endpoints";
import { fetchPublic } from "@/lib/api/fetch-public";
import { CacheTag } from "@/lib/cache/cache-tags";
import type { SiteSettings } from "@/lib/domain/site-settings";

export async function getSiteSettings(): Promise<SiteSettings> {
  return fetchPublic(getSiteSettingsEndpoint, { tags: [CacheTag.SITE_SETTINGS] });
}
