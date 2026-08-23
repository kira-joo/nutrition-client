import Image from "next/image";
import { Award, Quote } from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { LocalizedDoctorProfile } from "@/lib/domain/doctor-profile";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import AppRoute from "@/constant/AppRoute.enum";
import { LABEL_TYPE } from "@/components/ui/typography";
import { cn } from "@/lib/cn";

export interface DoctorPreviewSectionProps {
  doctorProfile: LocalizedDoctorProfile;
}

/**
 * An editorial media+copy split — real photo on one side, the doctor's own
 * first authored bio paragraph on the other, with a CTA through to the
 * full `/doctor` page. A third distinct shape alongside `TrustBandSection`
 * (numbered card grid) and `ProgramHighlightsSection` (connecting
 * timeline): per docs/design-system.md's anti-repetition rule, no two
 * homepage sections should share a layout.
 *
 * Two treatments layered onto that same real content rather than new
 * copy: the bio paragraph gets a pull-quote presentation (a decorative
 * opening-quote glyph, larger serif-weight size) instead of running as a
 * plain paragraph — brief §11 calls for a pull-quote on the first bio
 * section, and this already-authored text is what that section is. And
 * the photo carries a floating credential chip using `hero-values.ts`'
 * `experience` value — the same approved "6+ years experience" figure the
 * hero already shows, in a second placement rather than a fabricated one.
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
    <Section className="overflow-hidden bg-primary-soft">
      <Container>
        <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-20">
          <Reveal direction="none" duration="slow" ease="soft" className="relative order-2 lg:order-1">
            {doctorProfile.avatar ? (
              <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden shadow-lg surface-notched lg:mx-0">
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
              <div aria-hidden="true" className="mx-auto aspect-[4/5] w-full max-w-md surface-notched bg-surface lg:mx-0" />
            )}

            {/* Floating credential chip, overlapping the photo's inline-end
                edge — the one "premium editorial" device in this section.
                Absolute against the `Reveal` wrapper (which is the sized
                box here), not the image itself, so it never gets cropped by
                the image's own `overflow-hidden`. */}
            <div className="absolute -bottom-6 end-4 flex items-center gap-3 rounded-2xl bg-surface p-4 shadow-package sm:end-8">
              <span aria-hidden="true" className="flex size-icon-xl shrink-0 items-center justify-center rounded-full bg-primary text-white">
                <Award className="size-icon-md" />
              </span>
              <div className="flex flex-col">
                <span className="text-heading-3 font-black text-text-primary">{t("hero.values.experience.value")}</span>
                <span className="text-caption text-text-secondary">{t("hero.values.experience.label")}</span>
              </div>
            </div>
          </Reveal>

          <Reveal direction="up" className="order-1 flex flex-col items-start gap-5 lg:order-2">
            <p className={cn(LABEL_TYPE, "text-primary")}>{t("doctorPreview.label")}</p>
            <h2 className="text-heading-1 font-black text-text-primary">{doctorProfile.name}</h2>
            <div className="relative ps-9">
              <Quote aria-hidden="true" className="absolute start-0 top-0.5 size-6 text-primary/25" />
              <p className="text-body-xl text-text-secondary">{body}</p>
            </div>
            <Button href={AppRoute.Doctor} variant="secondary" className="mt-2">
              {t("doctorPreview.cta")}
            </Button>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
