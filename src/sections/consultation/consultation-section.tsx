import { getTranslations } from "next-intl/server";
import type { LocalizedDoctorProfile } from "@/lib/domain/doctor-profile";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { ConsultationForm } from "@/components/consultation/consultation-form";
import { ConsultationTrustPanel } from "@/components/consultation/consultation-trust-panel";

export interface ConsultationSectionProps {
  doctorProfile: LocalizedDoctorProfile;
  whatsappNumber?: string;
  packageKey?: string;
  packageName?: string;
}

/**
 * The form is first in the DOM (and visually first at every width) — a
 * visitor arriving here already wants to reach out, so the action itself
 * gets primary position rather than a wall of reassurance content coming
 * first, per this phase's "mobile is the primary interaction surface"
 * requirement. The trust panel becomes a real side-by-side sidebar only
 * once there's room for it (desktop); at every narrower width it simply
 * follows the form in normal document flow, no column layout to fight.
 *
 * Deliberately not another content-catalogue composition (a card grid or
 * an accordion) — a single, focused two-part layout is what a real
 * conversion page looks like.
 */
export async function ConsultationSection({ doctorProfile, whatsappNumber, packageKey, packageName }: ConsultationSectionProps) {
  const t = await getTranslations("consultation");

  return (
    <Section>
      <Container width="narrow">
        <header className="flex flex-col gap-3 text-center">
          <h1 className="text-display font-extrabold text-text-primary">{t("heading")}</h1>
          <p className="text-body-lg text-text-secondary">{t("intro", { doctorName: doctorProfile.name })}</p>
        </header>
      </Container>

      <Container className="mt-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_20rem] lg:items-start lg:gap-12">
          <div className="rounded-2xl border-hairline border-border bg-surface p-6 shadow-sm sm:p-8">
            <ConsultationForm doctorName={doctorProfile.name} packageKey={packageKey} packageName={packageName} whatsappNumber={whatsappNumber} />
          </div>

          <ConsultationTrustPanel doctorProfile={doctorProfile} />
        </div>
      </Container>
    </Section>
  );
}
