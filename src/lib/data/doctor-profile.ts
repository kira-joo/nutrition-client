import { getDoctorProfileEndpoint } from "../../../api/doctor-profile.endpoints";
import { fetchPublic } from "@/lib/api/fetch-public";
import { CacheTag } from "@/lib/cache/cache-tags";
import type { DoctorProfile } from "@/lib/domain/doctor-profile";

export async function getDoctorProfile(): Promise<DoctorProfile> {
  return fetchPublic(getDoctorProfileEndpoint, { tags: [CacheTag.DOCTOR_PROFILE] });
}
