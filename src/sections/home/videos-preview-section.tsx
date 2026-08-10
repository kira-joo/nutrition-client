import { getTranslations } from "next-intl/server";
import type { LocalizedVideo } from "@/lib/domain/video";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { SectionHeader } from "@/components/ui/section-header";
import { RevealGroup } from "@/components/ui/reveal";
import { VideoCard } from "@/components/videos/video-card";
import AppRoute from "@/constant/AppRoute.enum";

export interface VideosPreviewSectionProps {
  videos: LocalizedVideo[];
}

const PREVIEW_COUNT = 3;

/**
 * Renders the exact same `VideoCard` the `/videos` listing uses — there is
 * no second, homepage-only video card. The previous version here was a
 * visibly different "film poster" treatment (dark scrim-overlaid caption,
 * 4:5 crop) next to the listing's plain landscape cards; per the "one
 * canonical card per domain" rule that's exactly the duplication to avoid,
 * a stylistic preference isn't a strong enough reason to keep two designs
 * for the same entity. `VideoCard` renders as an `<li>`, so this wraps the
 * grid in `RevealGroup`'s `as="ul"` to keep real list semantics.
 *
 * Every card still links to the real `/videos/[id]` detail page — nothing
 * plays inline on the homepage. No horizontal scroll at any width: 1 → 2 →
 * 3 columns, same as Recipes.
 */
export async function VideosPreviewSection({ videos }: VideosPreviewSectionProps) {
  if (videos.length === 0) return null;
  const t = await getTranslations("home");
  const featured = videos.slice(0, PREVIEW_COUNT);

  return (
    <Section>
      <Container>
        <SectionHeader
          eyebrow={t("videosPreview.label")}
          title={t("videosPreview.heading")}
          description={t("videosPreview.body")}
          actionLabel={t("videosPreview.viewAll")}
          actionHref={AppRoute.Videos}
        />

        <RevealGroup as="ul" className="mt-heading-gap grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {featured.map((video, index) => (
            <VideoCard key={video._id} video={video} priority={index < 3} />
          ))}
        </RevealGroup>
      </Container>
    </Section>
  );
}
