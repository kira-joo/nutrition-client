import Image from "next/image";
import { getTranslations } from "next-intl/server";
import type { LocalizedDoctorProfile } from "@/lib/domain/doctor-profile";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import AppRoute from "@/constant/AppRoute.enum";

export interface DoctorPreviewSectionProps {
  doctorProfile: LocalizedDoctorProfile;
}

/**
 * An editorial media+copy split — real photo on one side, the doctor's own
 * first authored bio paragraph on the other, with a CTA through to the
 * full `/doctor` page. A third distinct shape alongside `TrustBandSection`
 * (borderless numbered list) and `ProgramHighlightsSection` (feature row):
 * per docs/design-system.md's anti-repetition rule, no two homepage
 * sections should share a layout.
 *
 * Uses real, previously homepage-unused content: `bioSections[0].body` is
 * only ever rendered on `/doctor` today. Only the first section is shown
 * here (clamped) — the rest is what the CTA is for, not a duplicate wall
 * of text on the homepage.
 */
export function DoctorPreviewSection({ doctorProfile }: DoctorPreviewSectionProps) {
  const bio = [...doctorProfile.bioSections].sort((a, b) => a.order - b.order)[0];
  if (!bio?.body) return null;

  return <DoctorPreviewContent doctorProfile={doctorProfile} body={bio.body} />;
}

async function DoctorPreviewContent({ doctorProfile, body }: { doctorProfile: LocalizedDoctorProfile; body: string }) {
  const t = await getTranslations("home");
  const avatarAlt = doctorProfile.avatarAlt || doctorProfile.name;

  return (
    <Section>
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal direction="none" duration="slow" ease="soft" className="order-2 lg:order-1">
            {doctorProfile.avatar ? (
              <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-xl shadow-md lg:mx-0">
                <Image
                  src={doctorProfile.avatar.secureUrl}
                  alt={avatarAlt}
                  fill
                  sizes="(min-width: 1024px) 32rem, 24rem"
                  className="object-cover"
                  placeholder={doctorProfile.avatar.placeholderUrl ? "blur" : undefined}
                  blurDataURL={doctorProfile.avatar.placeholderUrl}
                />
              </div>
            ) : (
              <div aria-hidden="true" className="mx-auto aspect-[4/5] w-full max-w-md rounded-xl bg-primary-soft lg:mx-0" />
            )}
          </Reveal>

          <Reveal direction="up" className="order-1 flex flex-col items-start gap-4 lg:order-2">
            <p className="text-label font-semibold uppercase tracking-wide text-primary">{t("doctorPreview.label")}</p>
            <h2 className="text-heading-1 font-bold text-text-primary">{doctorProfile.name}</h2>
            <p className="text-body-lg text-text-secondary">{body}</p>
            <Button href={AppRoute.Doctor} variant="secondary" className="mt-2">
              {t("doctorPreview.cta")}
            </Button>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
