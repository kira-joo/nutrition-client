import type { Locale } from "@/constant/Locale.enum";
import { getDoctorProfile, getPackages, getSiteSettings } from "@/lib/data";
import { ConsultationSection } from "@/sections/consultation/consultation-section";

interface ConsultationPageProps {
  params: { locale: Locale };
  searchParams: Record<string, string | string[] | undefined>;
}

/**
 * The one canonical lead-capture experience — replaces both the legacy
 * `/consultation` (a 10-field form that never sent anything to a backend,
 * only opened WhatsApp) and `/send-message` (a single-field version of the
 * exact same pattern, with zero live inbound links anywhere in the app).
 * Both represented the same underlying intent — a visitor reaching out —
 * so there's one real form here instead of two, matching the real intake
 * `CreateConsultationRequestDto` actually accepts.
 *
 * `?package=` is only ever turned into a `packageKey` (and a visible
 * "regarding the X package" note) once it resolves against a real,
 * currently-published package — a stale or mistyped key never gets
 * silently forwarded to the backend or shown to the visitor as if it were
 * real context.
 */
export default async function ConsultationPage({ params, searchParams }: ConsultationPageProps) {
  const packageKeyParam = Array.isArray(searchParams.package) ? searchParams.package[0] : searchParams.package;

  const [doctorProfile, siteSettings, packages] = await Promise.all([
    getDoctorProfile(params.locale),
    getSiteSettings(params.locale),
    packageKeyParam ? getPackages(params.locale) : Promise.resolve(null),
  ]);

  const matchedPackage = packageKeyParam ? packages?.find((candidate) => candidate.key === packageKeyParam) : undefined;

  return (
    <ConsultationSection
      doctorProfile={doctorProfile}
      whatsappNumber={siteSettings.whatsappNumber || siteSettings.phone}
      packageKey={matchedPackage?.key}
      packageName={matchedPackage?.name}
    />
  );
}
