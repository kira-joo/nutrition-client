import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { ArrowLeft, ExternalLink, Play, Video as VideoIcon } from "lucide-react";
import type { LocalizedVideo } from "@/lib/domain/video";
import AppRoute from "@/constant/AppRoute.enum";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

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
          className="inline-flex items-center gap-2 text-body-sm font-semibold text-text-secondary transition-colors duration-fast hover:text-primary"
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
              className="group relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl border-hairline border-border bg-surface-muted shadow-sm"
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
              <span
                aria-hidden="true"
                className="absolute inset-0 flex items-center justify-center bg-scrim opacity-90 transition-opacity duration-base ease-standard group-hover:opacity-100"
              >
                <span className="flex size-icon-xl items-center justify-center rounded-full bg-surface/90 text-primary shadow-md">
                  <Play className="size-icon-md" />
                </span>
              </span>
              <span className="sr-only">({t("detail.opensInNewTab")})</span>
            </a>
          ) : (
            <div className="flex aspect-video w-full items-center justify-center rounded-xl border-hairline border-border bg-surface-muted text-text-muted">
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
