"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { ExternalLink, Play, Video as VideoIcon } from "lucide-react";
import type { LocalizedVideo } from "@/lib/domain/video";

export interface VideoCardProps {
  video: LocalizedVideo;
  /** Whether this card is the one other cards should yield to. */
  isActive: boolean;
  /** Tells the grid this card just started playing, so siblings pause. */
  onActivate: () => void;
}

/** A bare hostname for the "view original" link — real derived data, never a fabricated provider name. */
function externalHost(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

/**
 * One video record, rendered per the actual data on it — never a generic
 * card template:
 *
 * - An uploaded `video` (regardless of whether `externalUrl` is also set)
 *   gets the real native `<video controls>` player, per the project's
 *   explicit no-custom-controls decision. A visible "plays here" badge
 *   makes that obvious before any interaction, not just after clicking.
 * - `externalUrl` alone (no uploaded asset) gets a real external-link
 *   card — never an embed pretending to be first-party playback — with an
 *   equally obvious "opens externally" badge.
 *
 * Every real record today happens to carry both fields (verified against
 * live data), so the secondary "view original" link under the player is
 * the commonly-exercised path; the externalUrl-only branch below is
 * exercised by the schema's contract, not by any current record.
 */
export function VideoCard({ video, isActive, onActivate }: VideoCardProps) {
  const t = useTranslations("videos");
  const videoRef = useRef<HTMLVideoElement>(null);

  // No shared player instance exists to control centrally — each card owns
  // its own <video>, so losing "active" status is this card's own cue to
  // pause itself rather than leaving two clips playing over each other.
  useEffect(() => {
    if (!isActive) videoRef.current?.pause();
  }, [isActive]);

  // Staff-chosen override first, then the poster Cloudinary derives for an
  // uploaded video (VideoAsset.posterUrl) — never a synthesized still frame.
  const posterUrl = video.poster?.secureUrl ?? video.video?.posterUrl ?? undefined;

  if (video.video) {
    const asset = video.video;
    const host = video.externalUrl ? externalHost(video.externalUrl) : null;

    return (
      <li className="flex flex-col gap-2">
        <div className="relative aspect-[9/16] w-full overflow-hidden rounded-xl bg-black shadow-sm">
          <span className="pointer-events-none absolute start-2 top-2 z-10 inline-flex items-center gap-1 rounded-full bg-surface/90 px-2.5 py-1 text-caption font-semibold text-primary shadow-sm backdrop-blur">
            <Play className="size-icon-sm" aria-hidden="true" />
            {t("card.playsHere")}
          </span>
          {/* Native controls only — no custom control surface. Gives
              fullscreen and Picture-in-Picture for free; neither is
              suppressed. `muted` is never set, and nothing here ever
              autoplays: `controls` alone requires an explicit user
              interaction to start sound or motion. */}
          <video
            ref={videoRef}
            controls
            preload="metadata"
            poster={posterUrl}
            playsInline
            onPlay={onActivate}
            className="size-full object-cover"
          >
            <source src={asset.secureUrl} type={`video/${asset.format}`} />
          </video>
        </div>

        <p className="break-words text-body-sm font-semibold text-text-primary">{video.title}</p>

        {video.externalUrl && (
          <a
            href={video.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-caption font-medium text-text-secondary hover:text-primary"
          >
            <ExternalLink className="size-icon-sm shrink-0" aria-hidden="true" />
            <span>{host ? t("card.viewOriginal", { host }) : t("card.watchExternally")}</span>
            <span className="sr-only">({t("card.opensInNewTab")})</span>
          </a>
        )}
      </li>
    );
  }

  // externalUrl-only: there is nothing to host locally, so the whole card
  // is a real link to the source rather than an embed faking first-party
  // playback.
  return (
    <li>
      <a href={video.externalUrl} target="_blank" rel="noopener noreferrer" className="group flex flex-col gap-2">
        <div className="relative flex aspect-[9/16] w-full items-center justify-center overflow-hidden rounded-xl border-hairline border-border bg-surface-muted shadow-sm">
          {posterUrl ? (
            <Image
              src={posterUrl}
              alt=""
              fill
              sizes="(min-width: 1024px) 18rem, 45vw"
              className="object-cover"
              placeholder={video.poster?.placeholderUrl ? "blur" : undefined}
              blurDataURL={video.poster?.placeholderUrl}
            />
          ) : (
            <span aria-hidden="true" className="flex flex-col items-center gap-2 px-4 text-center text-text-muted">
              <VideoIcon className="size-icon-xl" />
              <span className="text-caption">{t("card.noPreview")}</span>
            </span>
          )}
          <span className="absolute end-2 top-2 inline-flex items-center gap-1 rounded-full bg-surface/90 px-2.5 py-1 text-caption font-semibold text-text-primary shadow-sm backdrop-blur">
            <ExternalLink className="size-icon-sm" aria-hidden="true" />
            {t("card.opensExternally")}
          </span>
        </div>

        <span className="inline-flex items-start gap-1.5 break-words text-body-sm font-semibold text-text-primary group-hover:text-primary">
          {video.title}
          <span className="sr-only">({t("card.opensInNewTab")})</span>
        </span>
      </a>
    </li>
  );
}
