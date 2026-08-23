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

      <Container width="content" className="relative py-6 lg:py-8">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-12">
          <div className="order-2 flex flex-col items-start gap-5 lg:order-1">
            <Reveal direction="up" distance={16} duration="reveal" ease="emphasized">
              <p className={cn(LABEL_TYPE, "text-primary")}>{name}</p>
            </Reveal>
            <Reveal direction="up" distance={24} duration="reveal" ease="emphasized" delay={0.08}>
              {/* Deliberately smaller than the shared `text-display` token
                  (used everywhere else an `h1` needs display size — page
                  headers, detail heroes) rather than a global change: this
                  tagline is a full sentence (name + specialty), not a short
                  title, and at `text-display`'s 72px max it wrapped into
                  4 heavy lines. This scoped clamp tops out at 60px, enough
                  words fit per line that it now wraps in 2-3 controlled
                  lines instead. */}
              <h1 className="text-[clamp(2.25rem,1.3rem+2.8vw,3.25rem)] font-extrabold leading-tight text-text-primary">
                {tagline}
              </h1>
            </Reveal>
            <Reveal direction="up" distance={20} duration="reveal" ease="soft" delay={0.16}>
              <p className="text-body-xl text-text-secondary">{t("hero.description")}</p>
            </Reveal>
            <Reveal direction="up" distance={16} duration="base" ease="standard" delay={0.24}>
              <div className="flex flex-wrap items-center gap-4">
                <Button href={AppRoute.Consultation} size="lg" className="font-bold">
                  {t("hero.primaryCta")}
                </Button>
                <Button href={AppRoute.Packages} variant="secondary" size="lg">
                  {t("hero.secondaryCta")}
                </Button>
              </div>
            </Reveal>

            <Reveal
              direction="up"
              distance={16}
              duration="base"
              ease="standard"
              delay={0.32}
              className="mt-2 flex flex-wrap items-center gap-8"
            >
              {HERO_VALUE_ITEMS.map((item) => (
                <div key={item.key} className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="flex size-icon-xl items-center justify-center rounded-full bg-primary-soft text-primary"
                  >
                    <item.icon className="size-icon-md" />
                  </span>
                  <div className="flex flex-col">
                    <span className="text-heading-3 font-extrabold text-text-primary">
                      {t(`hero.values.${item.key}.value`)}
                    </span>
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
                768px — landscape again, and back to cropping a portrait master.
                `lg:max-w-md` again — it went `lg` → `md` → `sm` → back to
                `md`. The `sm` step was to fit the first viewport, which
                worked but then read as too small next to the headline's
                own visual weight. The headline dropping to a scoped,
                smaller display size (see the `h1` above) freed enough
                vertical room to bring the portrait back up a step and
                still fit — measured after both changes together, not
                assumed independently. */}
            <div className="relative mx-auto w-full max-w-sm lg:mx-0 lg:ms-auto lg:max-w-md">
              {/*
              Below `xl` the artwork is a bounded panel behind the portrait
              rather than a full-bleed section background. `xl`, not `lg`: the
              hero's box is still portrait at 1024 (0.79:1) and 1120 (0.92:1) and
              only turns landscape at 1280, so the full-bleed landscape layer
              would crop just as badly through that range.

              The panel's top is pulled in tight (`-top-4`, down from a
              symmetric `-inset-y-8`) so there's no band of empty artwork
              above her head, but its bottom now runs the full height of the
              portrait box — covering her down to the coat hem/crossed arms,
              where her own content actually ends. An earlier version cut the
              panel off at 80% height to force an overlap effect, which
              instead read as the background ending too early beneath her —
              the artwork has to extend as far as she visually does, or the
              "she's standing in this scene" read breaks the other way.
              `object-bottom` on the portrait still matters here: it's what
              keeps her anchored low and scaled up rather than centred with
              slack above and below, independent of where the panel ends.

              Inset negatively so it reads as a panel the portrait sits *in*
              rather than a border around it. Decorative, so empty `alt` and
              `aria-hidden`, and `pointer-events-none` because it overlaps a
              region that contains a real image.
            */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-[-1rem] -top-4 bottom-0 overflow-hidden rounded-[2.5rem] xl:hidden"
              >
                <Image
                  src={artwork.mobile}
                  alt=""
                  fill
                  /* Measured widths: 383 at 375px, 424 at 768, 477 at 1024, 552 at
                   1279 — it never fills the viewport, so `100vw` would fetch
                   roughly twice the pixels needed at the top of the range. */
                  sizes="(min-width: 1024px) 36rem, (min-width: 640px) 27rem, 100vw"
                  className="object-cover object-top"
                  priority
                />
              </div>

              {/*
              The hero's own cutout, not `doctorProfile.avatar` — see
              `constant/hero-portrait.ts` for why. It's a transparent cutout
              whose subject already fills a ~0.79:1 box, so it renders with
              `object-contain` and no circular mask: a circle crop would cut
              through the shoulders and crossed arms instead of respecting
              the silhouette the asset already has. `object-bottom`, not
              `object-center` — see the panel comment above: anchoring her to
              the bottom of her own box is what lets the panel stop short and
              still read as "she's standing in front of it," not "she's
              floating in the middle of it." No blur placeholder (it's a
              static local asset, not a Cloudinary upload with a generated
              one) and no `shadow-raised` — that box-shadow reads as a soft
              ambient glow behind a nearly-full-bleed subject, but was built
              for a hard-edged photo card, not a cutout.

              `overflow-hidden` on this `Reveal` root (removed again at
              `xl:`, matching the mobile panel's own `xl:hidden`) fixes a
              real bug: this box's un-translated height is what sizes its
              `relative` grandparent above, which is exactly the box the
              mobile/`lg` panel also sizes itself against (that panel's own
              `bottom-0` lands on this box's untranslated bottom edge). A
              `translate-y` moves the image without moving this box, so
              without a clip, any downward translate pushed her coat/hem
              past both edges at once — off the bottom of her own box AND
              past the panel's `bottom-0`, spilling onto the plain page
              background below the artwork. Clipping here means a downward
              shift now crops her own lower hem instead of escaping the
              panel — "anchored toward the bottom" reads as intentional
              framing, not a layout bug. `xl:overflow-visible` because true
              desktop has no panel to escape (the section-wide
              `HeroBackground` behind it has no hard bottom edge at this
              box's scale).
            */}
              <Reveal direction="none" duration="slow" ease="soft" delay={0.1} className="w-full overflow-hidden xl:overflow-visible">
                <div className="relative aspect-[4/5] w-full max-w-sm translate-y-14 lg:mx-0 lg:ms-auto lg:max-w-lg lg:translate-y-6 xl:translate-y-16">
                  <Image
                    src={HERO_PORTRAIT_SRC}
                    alt={avatarAlt}
                    fill
                    sizes="(min-width: 1024px) 32rem, 24rem"
                    className="object-contain object-bottom"
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
