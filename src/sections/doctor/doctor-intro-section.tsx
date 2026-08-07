import Image from "next/image";
import { resolveLocalized } from "@kira-joo/toolkit-common";
import type { DoctorProfile } from "@/lib/domain/doctor-profile";
import type { Locale } from "@/constant/Locale.enum";
import { Container } from "@/components/ui/container";

export interface DoctorIntroSectionProps {
  doctorProfile: DoctorProfile;
  locale: Locale;
}

/**
 * A centered editorial masthead, deliberately NOT the homepage hero's
 * asymmetric split — both open with the same portrait and tagline, so
 * reusing that layout here would make /doctor read as the homepage
 * reskinned. The portrait is smaller and circular, the name carries the
 * `h1`, and the tagline sits under it as a subtitle rather than as the
 * page's headline.
 */
export function DoctorIntroSection({ doctorProfile, locale }: DoctorIntroSectionProps) {
  const name = resolveLocalized(doctorProfile.name, locale);
  const tagline = resolveLocalized(doctorProfile.tagline, locale);
  const avatarAlt = resolveLocalized(doctorProfile.avatarAlt, locale) || name;

  return (
    <section className="bg-hero pb-12 pt-12 lg:pb-16 lg:pt-16">
      <Container width="narrow" className="flex flex-col items-center text-center">
        {doctorProfile.avatar && (
          <div className="relative size-32 overflow-hidden rounded-full shadow-raised ring-4 ring-surface lg:size-40">
            <Image
              src={doctorProfile.avatar.secureUrl}
              alt={avatarAlt}
              fill
              sizes="10rem"
              className="object-cover"
              priority
            />
          </div>
        )}
        <h1 className="mt-6 text-display font-extrabold text-text-primary">{name}</h1>
        {tagline && tagline !== name && <p className="mt-3 max-w-narrow text-body-lg text-text-secondary">{tagline}</p>}
      </Container>
    </section>
  );
}
