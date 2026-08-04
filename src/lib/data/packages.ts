import { getPackagesEndpoint } from "../../../api/packages.endpoints";
import { fetchPublic } from "@/lib/api/fetch-public";
import { CacheTag } from "@/lib/cache/cache-tags";
import type { Package } from "@/lib/domain/package";

/** No pagination on this endpoint — a small, fixed-size collection by design. Returned in whatever order nutrition-staff provides; the backend is the source of truth for ordering, so this never re-sorts client-side. */
export async function getPackages(): Promise<Package[]> {
  return fetchPublic(getPackagesEndpoint, { tags: [CacheTag.PACKAGES] });
}
