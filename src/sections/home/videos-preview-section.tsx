import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Play, Video as VideoIcon } from "lucide-react";
import type { LocalizedVideo } from "@/lib/domain/video";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { Link } from "@/i18n/navigation";
import AppRoute, { appHref } from "@/constant/AppRoute.enum";

export interface VideosPreviewSectionProps {
  videos: LocalizedVideo[];
}

const PREVIEW_COUNT = 3;

/**
 * The homepage's video feature, replacing the old 9:16 portrait rail.
 * Deliberately a different card treatment from `RecipesPreviewSection`'s
 * image-top/content-below cards — per docs/design-system.md's
 * anti-repetition rule, sections next to each other on the same page
 * shouldn't share a shape. These are full-bleed poster cards with the
 * title/description overlaid on a scrim, closer to a film poster than a
 * recipe card, which also reads as "media", not "food", at a glance.
 *
 * Every card links to the real `/videos/[id]` detail page — nothing plays
 * inline on the homepage. No horizontal scroll at any width: 1 → 2 → 3
 * columns, same as Recipes.
 */
export async function VideosPreviewSection({ videos }: VideosPreviewSectionProps) {
  if (videos.length === 0) return null;
  const t = await getTranslations("home");
  const featured = videos.slice(0, PREVIEW_COUNT);

  return (
    <Section>
      <Container>
        <Reveal className="flex flex-col items-start gap-2">
          <p className="text-label font-semibold uppercase tracking-wide text-accent">{t("videosPreview.label")}</p>
          <h2 className="text-heading-1 font-bold text-text-primary">{t("videosPreview.heading")}</h2>
          <p className="max-w-narrow text-body text-text-secondary">{t("videosPreview.body")}</p>
        </Reveal>

        <div className="mt-heading-gap grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {featured.map((video, index) => {
            const posterUrl = video.poster?.secureUrl ?? video.video?.posterUrl ?? undefined;

            return (
              <Reveal key={video._id} delay={index * 0.08}>
                <Link
                  href={appHref.video(video._id)}
                  className="group relative flex aspect-[4/5] w-full flex-col justify-end overflow-hidden rounded-xl bg-surface-inverse shadow-md transition-shadow duration-base ease-standard hover:shadow-raised"
                >
                  {posterUrl ? (
                    <Image
                      src={posterUrl}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 26rem, (min-width: 640px) 45vw, 90vw"
                      className="object-cover transition-transform duration-slow ease-standard pointer:group-hover:scale-105"
                    />
                  ) : (
                    <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center text-on-inverse-muted">
                      <VideoIcon className="size-icon-xl" />
                    </span>
                  )}
                  <span aria-hidden="true" className="absolute inset-0 bg-scrim" />
                  <span
                    aria-hidden="true"
                    // Centering, not a directional offset, so this uses the
                    // physical left/translate-x pair rather than logical
                    // start/end — the midpoint of the card is the same
                    // point regardless of reading direction.
                    className="absolute left-1/2 top-1/2 flex size-icon-xl -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-surface/90 text-primary opacity-90 shadow-md transition-opacity duration-base ease-standard group-hover:opacity-100"
                  >
                    <Play className="size-icon-md" />
                  </span>
                  <span className="relative flex flex-col gap-1 p-5 text-on-inverse">
                    <span className="min-w-0 break-words text-body-lg font-semibold">{video.title}</span>
                    {video.description && <span className="line-clamp-2 min-w-0 break-words text-body-sm text-on-inverse-muted">{video.description}</span>}
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <Button href={AppRoute.Videos} variant="ghost">
            {t("videosPreview.viewAll")}
          </Button>
        </div>
      </Container>
    </Section>
  );
}
