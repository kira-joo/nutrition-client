import type { LocalizedDoctorProfile } from "@/lib/domain/doctor-profile";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { GalleryFilmstrip } from "@/components/gallery/gallery-filmstrip";

export interface DoctorGallerySectionProps {
  doctorProfile: LocalizedDoctorProfile;
}

/**
 * Ordering happens here so the client filmstrip receives exactly the list it
 * renders. Alt text arrives already resolved from the data layer, including
 * the cross-locale fallback the real data needs — every gallery entry has an
 * empty `altText.ar` and a populated `altText.en`, so on /ar it resolves to
 * the English string rather than leaving an empty `alt` on a meaningful
 * image (§13).
 */
export function DoctorGallerySection({ doctorProfile }: DoctorGallerySectionProps) {
  const gallery = [...doctorProfile.gallery].sort((a, b) => a.order - b.order);
  if (gallery.length === 0) return null;

  const label = doctorProfile.featuredInLabel;
  const doctorName = doctorProfile.name;

  const items = gallery.map((entry) => ({
    key: entry.id,
    src: entry.image.secureUrl,
    alt: entry.altText || doctorName,
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
