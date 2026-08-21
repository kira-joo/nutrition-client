import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { ArrowLeft, ExternalLink, Video as VideoIcon } from "lucide-react";
import type { LocalizedVideo } from "@/lib/domain/video";
import AppRoute from "@/constant/AppRoute.enum";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { SURFACE_MUTED } from "@/components/ui/surface";
import { cn } from "@/lib/cn";
import { PlayOverlay } from "@/components/videos/play-overlay";

export interface VideoDetailProps {
  video: LocalizedVideo;
}

/** A bare hostname for the "watch on X" link — real derived data, never a fabricated provider name. Mirrors the old VideoCard's helper. */
function externalHost(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

/**
 * The one place a video actually plays or hands off to its source — cards
 * on the listing/homepage only ever link here now. An uploaded asset gets
 * the real native `<video controls>` player (no custom control surface,
 * per the project's standing decision); `externalUrl` renders as a real,
 * clearly-labeled external link, shown alongside the player when both are
 * present and as the primary action when only `externalUrl` exists —
 * never an embed pretending to be first-party playback.
 */
export async function VideoDetail({ video }: VideoDetailProps) {
  const t = await getTranslations("videos");
  const posterUrl = video.poster?.secureUrl ?? video.video?.posterUrl ?? undefined;
  const host = video.externalUrl ? externalHost(video.externalUrl) : null;

  return (
    <Section>
      <Container width="narrow">
        <Link
          href={AppRoute.Videos}
          className="inline-flex items-center gap-2 text-body-sm font-semibold text-text-secondary transition-colors duration-fast pointer:hover:text-primary"
        >
          <ArrowLeft className="size-icon-sm rtl:-scale-x-100" aria-hidden="true" />
          {t("detail.back")}
        </Link>

        <div className="mt-6 flex flex-col gap-6">
          {video.video ? (
            <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black shadow-md">
              {/* Native controls only — no custom control surface. `muted` is
                  never set and nothing autoplays: `controls` alone requires
                  an explicit user interaction to start sound or motion. */}
              <video controls preload="metadata" poster={posterUrl} playsInline className="size-full object-contain">
                <source src={video.video.secureUrl} type={`video/${video.video.format}`} />
              </video>
            </div>
          ) : video.externalUrl ? (
            <a
              href={video.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              /*
                The name has to carry the title. Everything inside this link is
                either decorative or generic — the poster has an empty `alt`, the
                play overlay is `aria-hidden`, and the only other text is
                "(opens in a new tab)" — so without this the link announced as
                nothing but its own target behaviour, which tells a screen-reader
                user what will happen but never what they are opening.
              */
              aria-label={`${t("detail.watchExternallyGeneric")}: ${video.title}`}
              className={cn("group relative flex aspect-video w-full items-center justify-center overflow-hidden shadow-sm", SURFACE_MUTED)}
            >
              {posterUrl ? (
                <Image
                  src={posterUrl}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 42rem, 100vw"
                  className="object-cover"
                  placeholder={video.poster?.placeholderUrl ? "blur" : undefined}
                  blurDataURL={video.poster?.placeholderUrl}
                />
              ) : (
                <span aria-hidden="true" className="flex flex-col items-center gap-2 text-text-muted">
                  <VideoIcon className="size-icon-xl" />
                  <span className="text-caption">{t("detail.noPreview")}</span>
                </span>
              )}
              <PlayOverlay restingScrim="visible" />
              <span className="sr-only">({t("detail.opensInNewTab")})</span>
            </a>
          ) : (
            <div className={cn("flex aspect-video w-full items-center justify-center text-text-muted", SURFACE_MUTED)}>
              <VideoIcon className="size-icon-xl" aria-hidden="true" />
            </div>
          )}

          <header className="flex flex-col gap-3">
            <h1 className="min-w-0 break-words text-display font-extrabold text-text-primary">{video.title}</h1>
            {video.description && <p className="break-words text-body-lg text-text-secondary">{video.description}</p>}
          </header>

          {video.externalUrl && (
            <Button href={video.externalUrl} external variant="secondary" className="self-start">
              <ExternalLink className="size-icon-sm" aria-hidden="true" />
              {host ? t("detail.watchExternally", { host }) : t("detail.watchExternallyGeneric")}
              <span className="sr-only">({t("detail.opensInNewTab")})</span>
            </Button>
          )}
        </div>
      </Container>
    </Section>
  );
}
