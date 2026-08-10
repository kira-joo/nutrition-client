import type { Locale } from "@/constant/Locale.enum";
import { getDoctorProfile } from "@/lib/data";
import { DoctorBioSection } from "@/sections/doctor/doctor-bio-section";
import { DoctorGallerySection } from "@/sections/doctor/doctor-gallery-section";
import { DoctorIntroSection } from "@/sections/doctor/doctor-intro-section";
import { ClosingCtaSection } from "@/sections/shared/closing-cta-section";
import { ProgramHighlightsSection } from "@/sections/shared/program-highlights-section";
import { TrustBandSection } from "@/sections/shared/trust-band-section";

interface DoctorPageProps {
  params: { locale: Locale };
}

/**
 * A single-source page, so there's no `safe()` per-section isolation to do
 * here (that pattern exists for the homepage's many independent fetches):
 * without the doctor profile there is no page at all, so a failure is
 * allowed to reach `error.tsx` rather than rendering an empty shell.
 *
 * The program-highlights and why-choose bands are the same components the
 * homepage renders, per the approved plan — shared outright rather than
 * duplicated, which is why they live in `sections/shared`. Each already
 * returns null when its CMS list is empty, so the page degrades section by
 * section without any conditional logic here.
 *
 * No process stepper: the plan lists one as a shared component here, but no
 * field in DoctorProfile (or any other public endpoint) backs it, and
 * inventing steps would mean fabricating clinical content. It stays unbuilt
 * until real data exists for it.
 */
export default async function DoctorPage({ params }: DoctorPageProps) {
  const doctorProfile = await getDoctorProfile(params.locale);

  return (
    <>
      <DoctorIntroSection doctorProfile={doctorProfile} />
      <DoctorBioSection doctorProfile={doctorProfile} />
      <ProgramHighlightsSection doctorProfile={doctorProfile} />
      <TrustBandSection doctorProfile={doctorProfile} />
      <DoctorGallerySection doctorProfile={doctorProfile} />
      <ClosingCtaSection />
    </>
  );
}
