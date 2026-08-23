import { MethodType, type Endpoint } from "@kira-joo/frontend-toolkit-core/server";
import { PublicApiRoute } from "./public-api-route";
import type { DoctorProfile } from "../domain/doctor-profile";

export const getDoctorProfileEndpoint: Endpoint<{ returnType: DoctorProfile }> = {
  url: PublicApiRoute.DOCTOR_PROFILE,
  methodType: MethodType.GET,
};
