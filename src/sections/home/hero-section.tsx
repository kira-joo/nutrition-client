import Image from "next/image";
import { getTranslations } from "next-intl/server";
import type { LocalizedDoctorProfile } from "@/lib/domain/doctor-profile";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { HeroBackground } from "@/sections/home/hero-background";
import { HERO_VALUE_ITEMS } from "@/constant/hero-values";
import AppRoute from "@/constant/AppRoute.enum";

export interface HeroSectionProps {
  doctorProfile: LocalizedDoctorProfile;
}

/**
 * The site's main visual statement, built around the real `heroSection.png`
 * artwork (never a CSS gradient/shape stand-in): decorative food framing at
 * both edges, the doctor's real photo in one of the artwork's two empty
 * zones, copy + CTAs + values in the other. Markup order is copy-first,
 * doctor-second; no explicit LTR/RTL override sits on top of that, so CSS
 * Grid's own direction-aware column order does the rest. In English that
 * renders as the ordinary text-left/photo-right hero, landing the doctor
 * in the artwork's right-hand oval zone. Under `dir="rtl"` the same two
 * columns swap physical sides on their own — text-right/photo-left —
 * which lands the doctor in the artwork's *left*-hand rounded zone
 * instead. Both outcomes line up with a real zone in the artwork; this
 * isn't one fixed composition mirrored badly, it's the same source order
 * reading correctly (and landing correctly) in either direction.
 *
 * Recomposed (not shrunk) below `lg`: doctor stacks above copy, and
 * `HeroBackground` swaps to a top-anchored crop rather than trying to land
 * the doctor inside the artwork's oval at a width the two-zone layout was
 * never built for.
 *
 * Stays an async Server Component — only `HeroBackground` (the ambient
 * drift/parallax) and `Reveal` (the entrance animation) are Client
 * Components; the doctor's name/tagline/photo render as real server HTML.
 */
export async function HeroSection({ doctorProfile }: HeroSectionProps) {
  const t = await getTranslations("home");
  const { name, tagline } = doctorProfile;
  const avatarAlt = doctorProfile.avatarAlt || name;

  return (
    <section className="relative isolate overflow-hidden">
      <HeroBackground />

      <Container width="wide" className="relative py-16 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
          <div className="order-2 flex flex-col items-start gap-6 lg:order-1">
            <Reveal direction="up" distance={16} duration="reveal" ease="emphasized">
              <p className="text-label font-semibold uppercase tracking-wide text-primary">{name}</p>
            </Reveal>
            <Reveal direction="up" distance={24} duration="reveal" ease="emphasized" delay={0.08}>
              <h1 className="text-display font-extrabold text-text-primary">{tagline}</h1>
            </Reveal>
            <Reveal direction="up" distance={20} duration="reveal" ease="soft" delay={0.16}>
              <p className="text-body-xl text-text-secondary">{t("hero.description")}</p>
            </Reveal>
            <Reveal direction="up" distance={16} duration="base" ease="standard" delay={0.24}>
              <div className="flex flex-wrap items-center gap-4">
                <Button href={AppRoute.Consultation} size="lg">
                  {t("hero.primaryCta")}
                </Button>
                <Button href={AppRoute.Packages} variant="secondary" size="lg">
                  {t("hero.secondaryCta")}
                </Button>
              </div>
            </Reveal>

            <Reveal direction="up" distance={16} duration="base" ease="standard" delay={0.32} className="mt-4 flex flex-wrap items-center gap-8">
              {HERO_VALUE_ITEMS.map((item) => (
                <div key={item.key} className="flex items-center gap-3">
                  <span aria-hidden="true" className="flex size-icon-xl items-center justify-center rounded-full bg-primary-soft text-primary">
                    <item.icon className="size-icon-md" />
                  </span>
                  <div className="flex flex-col">
                    <span className="text-heading-3 font-extrabold text-text-primary">{t(`hero.values.${item.key}.value`)}</span>
                    <span className="text-body-sm text-text-secondary">{t(`hero.values.${item.key}.label`)}</span>
                  </div>
                </div>
              ))}
            </Reveal>
          </div>

          <div className="order-1 lg:order-2">
            {doctorProfile.avatar ? (
              <Reveal direction="none" duration="slow" ease="soft" delay={0.1} className="mx-auto w-full max-w-sm lg:mx-0 lg:ms-auto lg:max-w-lg">
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-full shadow-raised">
                  <Image
                    src={doctorProfile.avatar.secureUrl}
                    alt={avatarAlt}
                    fill
                    sizes="(min-width: 1024px) 32rem, 24rem"
                    className="object-cover object-top"
                    placeholder={doctorProfile.avatar.placeholderUrl ? "blur" : undefined}
                    blurDataURL={doctorProfile.avatar.placeholderUrl}
                    priority
                  />
                </div>
              </Reveal>
            ) : (
              <div aria-hidden="true" className="mx-auto aspect-[4/5] w-full max-w-sm rounded-full bg-primary-soft lg:ms-auto lg:max-w-lg" />
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
