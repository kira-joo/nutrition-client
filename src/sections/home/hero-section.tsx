import Image from "next/image";
import { getTranslations } from "next-intl/server";
import type { LocalizedDoctorProfile } from "@/lib/domain/doctor-profile";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

export interface HeroSectionProps {
  doctorProfile: LocalizedDoctorProfile;
}

/**
 * Asymmetric split hero — portrait one side, headline/CTAs the other —
 * not a centered stack blown up for desktop. Reverses to a stacked layout
 * below `lg`, image first, per the site's mobile-first sequencing.
 */
export async function HeroSection({ doctorProfile }: HeroSectionProps) {
  const t = await getTranslations("home");
  const { name, tagline } = doctorProfile;
  const avatarAlt = doctorProfile.avatarAlt || name;

  return (
    <section className="relative overflow-hidden bg-hero pb-16 pt-12 lg:pb-24 lg:pt-16">
      <Container width="wide">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <div className="order-2 flex flex-col items-start gap-6 lg:order-1">
            <p className="text-label font-semibold uppercase tracking-wide text-primary">{name}</p>
            <h1 className="text-display font-extrabold text-text-primary">{tagline}</h1>
            <div className="flex flex-wrap items-center gap-4">
              <Button href="/consultation" size="lg">
                {t("hero.primaryCta")}
              </Button>
              <Button href="/packages" variant="secondary" size="lg">
                {t("hero.secondaryCta")}
              </Button>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            {doctorProfile.avatar ? (
              <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-xl shadow-raised lg:max-w-md">
                <Image src={doctorProfile.avatar.secureUrl} alt={avatarAlt} fill sizes="(min-width: 1024px) 28rem, 20rem" className="object-cover" priority />
              </div>
            ) : (
              <div aria-hidden="true" className="mx-auto aspect-[4/5] w-full max-w-sm rounded-xl bg-primary-soft lg:max-w-md" />
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
