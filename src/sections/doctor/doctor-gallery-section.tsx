import { resolveLocalized } from "@kira-joo/toolkit-common";
import type { DoctorProfile } from "@/lib/domain/doctor-profile";
import type { Locale } from "@/constant/Locale.enum";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { GalleryFilmstrip } from "@/components/gallery/gallery-filmstrip";

export interface DoctorGallerySectionProps {
  doctorProfile: DoctorProfile;
  locale: Locale;
}

/**
 * Server component: ordering and locale resolution happen here so the
 * client filmstrip receives plain strings rather than `LocalizedString`
 * objects and the locale machinery, keeping the client payload to what it
 * actually needs to be interactive.
 *
 * `resolveLocalized` supplies the cross-locale fallback the real data needs
 * — every gallery entry currently has an empty `altText.ar` and a populated
 * `altText.en`, so on /ar the alt text resolves to the English string
 * rather than rendering an empty `alt` on a meaningful image (§13).
 */
export function DoctorGallerySection({ doctorProfile, locale }: DoctorGallerySectionProps) {
  const gallery = [...doctorProfile.gallery].sort((a, b) => a.order - b.order);
  if (gallery.length === 0) return null;

  const label = resolveLocalized(doctorProfile.featuredInLabel, locale);
  const doctorName = resolveLocalized(doctorProfile.name, locale);

  const items = gallery.map((entry) => ({
    key: entry.id,
    src: entry.image.secureUrl,
    alt: resolveLocalized(entry.altText, locale) || doctorName,
    width: entry.image.width,
    height: entry.image.height,
    placeholderUrl: entry.image.placeholderUrl,
  }));

  return (
    <Section spacing="sm" className="border-y-hairline border-border bg-surface-muted">
      <Container>
        {label && (
          <Reveal>
            <h2 className="text-heading-1 font-bold text-text-primary">{label}</h2>
          </Reveal>
        )}
        <GalleryFilmstrip items={items} />
      </Container>
    </Section>
  );
}
