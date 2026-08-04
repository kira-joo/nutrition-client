import type { PublicEndpoint } from "../src/lib/api/public-endpoint.type";
import type { DoctorProfile } from "../src/lib/domain/doctor-profile";

export const getDoctorProfileEndpoint: PublicEndpoint<{ returnType: DoctorProfile }> = {
  url: "/api/public/doctor-profile",
};
