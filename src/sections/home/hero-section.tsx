import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import type { LocalizedDoctorProfile } from "@/lib/domain/doctor-profile";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { HeroBackground } from "@/sections/home/hero-background";
import { HERO_VALUE_ITEMS } from "@/constant/hero-values";
import { HERO_ARTWORK } from "@/constant/hero-artwork";
import { HERO_PORTRAIT_SRC } from "@/constant/hero-portrait";
import type { Locale } from "@/constant/Locale.enum";
import AppRoute from "@/constant/AppRoute.enum";
import { LABEL_TYPE } from "@/components/ui/typography";
import { cn } from "@/lib/cn";

export interface HeroSectionProps {
  doctorProfile: LocalizedDoctorProfile;
}

/**
 * The site's main visual statement, built around the real supplied artwork
 * (never a CSS gradient/shape stand-in): a botanical border framing a quiet
 * centre where copy and portrait sit. Markup order is copy-first,
 * doctor-second; no explicit LTR/RTL override sits on top of that, so CSS
 * Grid's own direction-aware column order does the rest — text and portrait
 * swap physical sides between `/en` and `/ar` on their own.
 *
 * **One artwork pair, not four.** Measured column-density symmetry (left
 * half vs right half within 1-3%) showed the supplied border has no
 * directional bias, so `HERO_ARTWORK` serves both locales from the same
 * desktop/mobile pair rather than needing separately composed masters — see
 * that file for the measurement. `HeroArtwork` still keys by locale so a
 * future directional asset can be dropped in per locale without touching
 * this component.
 *
 * The portrait is `HERO_PORTRAIT_SRC` — a dedicated transparent cutout
 * supplied for this composition, not `doctorProfile.avatar` (the CMS photo
 * used everywhere else the doctor appears). See `constant/hero-portrait.ts`
 * for why the two are deliberately different assets.
 *
 * Recomposed (not shrunk) below `xl`: the doctor stacks above the copy below
 * `lg`, and the artwork stops being a full-bleed background entirely — it
 * becomes a bounded panel behind the portrait, at the same 4:5 ratio the
 * portrait already uses. The border composition has nowhere to land at
 * phone widths, and stretching it behind the whole stacked hero meant
 * covering a 0.26:1 box from a 2.26:1 source. A bounded panel frames the
 * artwork at a ratio a real source asset can be composed for, and leaves
 * the copy on the plain page ground.
 *
 * Stays an async Server Component — only `HeroBackground` (the ambient
 * drift/parallax) and `Reveal` (the entrance animation) are Client
 * Components; the doctor's name/tagline/photo render as real server HTML.
 */
export async function HeroSection({ doctorProfile }: HeroSectionProps) {
  const [t, locale] = await Promise.all([getTranslations("home"), getLocale()]);
  const artwork = HERO_ARTWORK[locale as Locale];
  const { name, tagline } = doctorProfile;
  const avatarAlt = doctorProfile.avatarAlt || name;

  return (
    <section className="relative isolate overflow-hidden">
      <HeroBackground src={artwork.desktop} />

      <Container width="wide" className="relative py-16 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
          <div className="order-2 flex flex-col items-start gap-6 lg:order-1">
            <Reveal direction="up" distance={16} duration="reveal" ease="emphasized">
              <p className={cn(LABEL_TYPE, "text-primary")}>{name}</p>
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
            {/* Sized to the portrait rather than to the grid column, so the
                bounded panel keeps the portrait's 4:5 ratio at every mobile
                width. Anchored to the column instead, it measured 1.40:1 at
                768px — landscape again, and back to cropping a portrait master. */}
            <div className="relative mx-auto w-full max-w-sm lg:mx-0 lg:ms-auto lg:max-w-lg">
            {/*
              Below `xl` the artwork is a bounded panel behind the portrait
              rather than a full-bleed section background. `xl`, not `lg`: the
              hero's box is still portrait at 1024 (0.79:1) and 1120 (0.92:1) and
              only turns landscape at 1280, so the full-bleed landscape layer
              would crop just as badly through that range.

              The background it replaces had to cover a 375x1458 box — a 0.26:1
              sliver — from a 2.26:1 landscape source, which meant scaling the
              artwork about 8.8x and showing roughly the middle 11% of the frame.
              Measured, not estimated. This panel is sized to the portrait block,
              which is already `aspect-[4/5]`, so the artwork is framed at the
              ratio its own master is composed for and the copy below sits on the
              plain page ground where it is easiest to read.

              Inset negatively so it reads as a panel the portrait sits *in*
              rather than a border around it. Decorative, so empty `alt` and
              `aria-hidden`, and `pointer-events-none` because it overlaps a
              region that contains a real image.
            */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-[-1.25rem] -inset-y-8 overflow-hidden rounded-[2.5rem] xl:hidden"
            >
              <Image
                src={artwork.mobile}
                alt=""
                fill
                /* Measured widths: 383 at 375px, 424 at 768, 477 at 1024, 552 at
                   1279 — it never fills the viewport, so `100vw` would fetch
                   roughly twice the pixels needed at the top of the range. */
                sizes="(min-width: 1024px) 36rem, (min-width: 640px) 27rem, 100vw"
                className="object-cover object-center"
                priority
              />
            </div>

            {/*
              The hero's own cutout, not `doctorProfile.avatar` — see
              `constant/hero-portrait.ts` for why. It's a transparent cutout
              whose subject already fills a ~0.79:1 box, so it renders with
              `object-contain` and no circular mask: a circle crop would cut
              through the shoulders and crossed arms instead of respecting
              the silhouette the asset already has. No blur placeholder
              (it's a static local asset, not a Cloudinary upload with a
              generated one) and no `shadow-raised` — that box-shadow reads
              as a soft ambient glow behind a nearly-full-bleed subject, but
              was built for a hard-edged photo card, not a cutout.
            */}
            <Reveal direction="none" duration="slow" ease="soft" delay={0.1} className="w-full">
              <div className="relative aspect-[4/5] w-full">
                <Image
                  src={HERO_PORTRAIT_SRC}
                  alt={avatarAlt}
                  fill
                  sizes="(min-width: 1024px) 32rem, 24rem"
                  className="object-contain object-center"
                  priority
                />
              </div>
            </Reveal>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
