import { localize, type LocalizedLocale } from "@kira-joo/toolkit-common";
import { getDoctorProfileEndpoint } from "../../../api/doctor-profile.endpoints";
import { fetchPublic } from "@/lib/api/fetch-public";
import { CacheTag } from "@/lib/cache/cache-tags";
import type { DoctorProfile, LocalizedDoctorProfile } from "@/lib/domain/doctor-profile";

/**
 * Localization happens here, once, immediately after the fetch — never in
 * sections or components. Caching stays locale-independent on purpose: the
 * cached entry is the raw bilingual payload keyed by URL, so both locales
 * share one cache entry and one revalidation, and `localize` runs per
 * request on the already-cached data.
 */
export async function getDoctorProfile(locale: LocalizedLocale): Promise<LocalizedDoctorProfile> {
  const raw: DoctorProfile = await fetchPublic(getDoctorProfileEndpoint, { tags: [CacheTag.DOCTOR_PROFILE] });
  return localize(raw, locale);
}
