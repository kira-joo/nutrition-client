import Image from "next/image";
import { getTranslations } from "next-intl/server";
import type { LocalizedDoctorProfile } from "@/lib/domain/doctor-profile";

export interface ConsultationTrustPanelProps {
  doctorProfile: LocalizedDoctorProfile;
}

/**
 * Preserves the expectation-setting content the legacy form's sidebar
 * carried (real conversation with the doctor, lab-test/InBody guidance) as
 * copy, not as fields — none of it exists in the real consultation DTO,
 * and inventing form fields to collect it would just build a request the
 * backend can't store. The doctor's name/photo come from real
 * `doctor-profile` data instead of the legacy page's hardcoded text.
 */
export async function ConsultationTrustPanel({ doctorProfile }: ConsultationTrustPanelProps) {
  const t = await getTranslations("consultation");
  const avatarAlt = doctorProfile.avatarAlt || doctorProfile.name;

  return (
    <aside className="flex flex-col gap-6 rounded-2xl bg-surface-muted p-6 sm:p-8">
      <div className="flex items-center gap-4">
        {doctorProfile.avatar ? (
          <div className="relative size-16 shrink-0 overflow-hidden rounded-full">
            <Image src={doctorProfile.avatar.secureUrl} alt={avatarAlt} fill sizes="4rem" className="object-cover" />
          </div>
        ) : null}
        <div>
          <p className="text-body-lg font-bold text-text-primary">{doctorProfile.name}</p>
          <p className="text-body-sm text-text-secondary">{doctorProfile.tagline}</p>
        </div>
      </div>

      <div>
        <h2 className="text-heading-3 font-bold text-text-primary">{t("trust.welcomeHeading")}</h2>
        <p className="mt-2 text-body-sm text-text-secondary">{t("trust.welcomeBody", { doctorName: doctorProfile.name })}</p>
      </div>

      <div>
        <h2 className="text-heading-3 font-bold text-text-primary">{t("trust.prepHeading")}</h2>
        <ul className="mt-2 flex flex-col gap-2 text-body-sm text-text-secondary">
          <li>{t("trust.labTestsNote")}</li>
          <li>{t("trust.inbodyNote")}</li>
        </ul>
      </div>
    </aside>
  );
}
