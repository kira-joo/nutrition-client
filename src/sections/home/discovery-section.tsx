import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { ExternalLink, Play } from "lucide-react";
import { resolveLocalized } from "@kira-joo/toolkit-common";
import type { Recipe } from "@/lib/domain/recipe";
import type { Video } from "@/lib/domain/video";
import type { Locale } from "@/constant/Locale.enum";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { Link } from "@/i18n/navigation";

export interface DiscoverySectionProps {
  recipes: Recipe[];
  videos: Video[];
  locale: Locale;
}

/**
 * The homepage's "lifestyle" beat, sitting between social proof (reviews)
 * and objection-handling (FAQ): recipes and videos are what make the
 * clinic feel like an ongoing practice rather than a price list.
 *
 * Structurally the one horizontally-scrolling section on the page, which
 * is deliberate — per docs/design-system.md's anti-repetition rule, every
 * section needs its own identity, and nothing else here scrolls sideways
 * or nests sub-rails. It also carries the third distinct GSAP entrance
 * treatment (a directional reveal per rail, not the staggered-children or
 * fade-up used elsewhere), and uses `primary-soft` as a third surface tone
 * so it doesn't read as another `surface-muted` band next to the FAQ.
 *
 * Rails are native `overflow-x` scrollers rather than a JS carousel: the
 * cards are real links, so Tab reaches every one and the browser scrolls
 * it into view for free. That satisfies §19's "never swipe-only" rule
 * without shipping carousel controls this section doesn't need (per the
 * plan, the site's one carousel belongs to /reviews' featured strip).
 */
export async function DiscoverySection({ recipes, videos, locale }: DiscoverySectionProps) {
  // Rendered only when there's genuinely something to discover — an empty
  // rail with a heading over it would look broken rather than intentional.
  if (recipes.length === 0 && videos.length === 0) return null;
  const t = await getTranslations("home");

  // Bleeds past the container's gutter on mobile/tablet so the rail reads
  // as a native swipeable strip, snapping back inside it at `lg` where a
  // full-bleed row would push content past a comfortable measure. The
  // negative margins mirror Container's own `px-*` scale exactly.
  const railClass =
    "mt-4 -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0";

  return (
    <Section className="bg-primary-soft">
      <Container>
        <Reveal className="flex flex-col items-start gap-2">
          <p className="text-label font-semibold uppercase tracking-wide text-accent">{t("discover.label")}</p>
          <h2 className="text-heading-1 font-bold text-text-primary">{t("discover.heading")}</h2>
          <p className="max-w-narrow text-body text-text-secondary">{t("discover.body")}</p>
        </Reveal>

        {recipes.length > 0 && (
          <Reveal direction="left" className="mt-10">
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="text-heading-3 font-bold text-text-primary">{t("discover.recipesHeading")}</h3>
              <Button href="/recipes" variant="ghost" size="sm">
                {t("discover.recipesViewAll")}
              </Button>
            </div>

            <ul className={railClass}>
              {recipes.map((recipe) => (
                <li key={recipe._id} className="w-56 shrink-0 snap-start sm:w-64">
                  {/* Plain path string, matching nav-items.ts's convention — deliberately not the legacy `AppRoute` enum's Express-style `/recipes/:id`, which exists only for the legacy `AppLink` this rebuild replaces. */}
                  <Link
                    href={`/recipes/${recipe._id}`}
                    className="group flex h-full flex-col overflow-hidden rounded-xl border-hairline border-border bg-surface shadow-sm transition-shadow duration-base ease-standard hover:shadow-md"
                  >
                    <div className="relative aspect-[4/3]">
                      <Image
                        src={recipe.image.secureUrl}
                        alt={resolveLocalized(recipe.title, locale)}
                        fill
                        sizes="(min-width: 640px) 16rem, 14rem"
                        className="object-cover"
                      />
                      <span className="absolute bottom-2 start-2 rounded-full bg-surface/90 px-2.5 py-1 text-caption font-semibold text-text-primary backdrop-blur">
                        {resolveLocalized(recipe.category.title, locale)}
                      </span>
                    </div>
                    <span className="p-4 text-body-sm font-semibold text-text-primary transition-colors duration-fast group-hover:text-primary">
                      {resolveLocalized(recipe.title, locale)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Reveal>
        )}

        {videos.length > 0 && (
          <Reveal direction="right" className="mt-12">
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="text-heading-3 font-bold text-text-primary">{t("discover.videosHeading")}</h3>
              <Button href="/videos" variant="ghost" size="sm">
                {t("discover.videosViewAll")}
              </Button>
            </div>

            <ul className={railClass}>
              {videos.map((video) => {
                // Staff-chosen override first, then the poster Cloudinary
                // derives for every uploaded video (VideoAsset.posterUrl) —
                // no still frame is ever synthesized here. Verified against
                // live data: `poster` is currently unset on all videos while
                // `video.posterUrl` is populated, so the fallback is the
                // real path in practice, not a theoretical one.
                const posterUrl = video.poster?.secureUrl ?? video.video?.posterUrl ?? null;
                const title = resolveLocalized(video.title, locale);

                const thumbnail = (
                  <>
                    <div className="relative aspect-[9/16] overflow-hidden rounded-xl bg-surface-muted shadow-sm">
                      {posterUrl ? <Image src={posterUrl} alt="" fill sizes="11rem" className="object-cover" /> : null}
                      <span
                        aria-hidden="true"
                        className="absolute inset-0 flex items-center justify-center bg-scrim opacity-90 transition-opacity duration-base ease-standard group-hover:opacity-100"
                      >
                        <span className="flex size-icon-xl items-center justify-center rounded-full bg-surface/90 text-primary shadow-md">
                          <Play className="size-icon-sm" />
                        </span>
                      </span>
                    </div>
                  </>
                );

                return (
                  <li key={video._id} className="w-40 shrink-0 snap-start sm:w-44">
                    {/*
                      An `externalUrl` video opens out to its source rather
                      than pretending to offer first-party playback (§13's
                      rule). A self-hosted-only video has nowhere external to
                      go, so it routes to /videos, where Phase 6.6 builds the
                      real accessible player — this band stays a discovery
                      strip rather than half-building a player here. The type
                      genuinely allows either (the backend guarantees only
                      that at least one of the two is present), so this isn't
                      defensive padding around data that's always populated.
                    */}
                    {video.externalUrl ? (
                      <a href={video.externalUrl} target="_blank" rel="noopener noreferrer" className="group flex h-full flex-col gap-2">
                        {thumbnail}
                        <span className="flex items-start gap-1.5 text-body-sm font-semibold text-text-primary transition-colors duration-fast group-hover:text-primary">
                          {title}
                          <ExternalLink className="mt-0.5 size-icon-sm shrink-0 text-text-muted" aria-hidden="true" />
                          <span className="sr-only">({t("discover.opensInNewTab")})</span>
                        </span>
                      </a>
                    ) : (
                      <Link href="/videos" className="group flex h-full flex-col gap-2">
                        {thumbnail}
                        <span className="text-body-sm font-semibold text-text-primary transition-colors duration-fast group-hover:text-primary">{title}</span>
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </Reveal>
        )}
      </Container>
    </Section>
  );
}
