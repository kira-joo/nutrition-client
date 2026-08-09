import Image from "next/image";
import { useTranslations } from "next-intl";
import { Play, Video as VideoIcon } from "lucide-react";
import type { LocalizedVideo } from "@/lib/domain/video";
import { Link } from "@/i18n/navigation";
import { appHref } from "@/constant/AppRoute.enum";

export interface VideoCardProps {
  video: LocalizedVideo;
  /** Only the first row of the first page should be eager; everything else stays lazy (§13). */
  priority?: boolean;
}

/**
 * A substantial landscape media card — real poster/preview, title, and the
 * real `description` field once staff has authored it — whose whole
 * surface links through to `/videos/[id]`. Playback and the "opens
 * externally" distinction both now live on the detail page, not here: with
 * every card navigating to a real route, there's no more "which of these
 * cards is currently playing" state to coordinate across siblings (the
 * portrait tiles this replaces each owned an inline `<video>` and a shared
 * active-card lock in `VideosGrid` — gone along with the inline players).
 *
 * Matches `RecipeCard`'s content-box structure (fixed image ratio, a
 * two-line-reserved title, a two-line-clamped description) so the two
 * media grids read as the same design system rather than two unrelated
 * card components — including always rendering the description's
 * reserved-height container rather than collapsing it when a video has
 * none: every video today has an empty `description` (the field only
 * just shipped), so a `{video.description && ...}` conditional here
 * would look fine now and then silently reproduce RecipeCard's exact
 * "some rows are shorter than others" bug the moment staff fills in a
 * description for only some videos.
 */
export function VideoCard({ video, priority = false }: VideoCardProps) {
  const t = useTranslations("videos");
  // Staff-chosen override first, then the poster Cloudinary derives for an
  // uploaded video (VideoAsset.posterUrl) — never a synthesized still frame.
  const posterUrl = video.poster?.secureUrl ?? video.video?.posterUrl ?? undefined;

  return (
    <li className="flex">
      <Link
        href={appHref.video(video._id)}
        className="group flex h-full w-full flex-col overflow-hidden rounded-xl border-hairline border-border bg-surface shadow-sm transition-shadow duration-base ease-standard hover:shadow-md"
      >
        <div className="relative aspect-video bg-surface-muted">
          {posterUrl ? (
            <Image
              src={posterUrl}
              alt=""
              fill
              sizes="(min-width: 1024px) 26rem, (min-width: 640px) 45vw, 90vw"
              className="object-cover"
              priority={priority}
              placeholder={video.poster?.placeholderUrl ? "blur" : undefined}
              blurDataURL={video.poster?.placeholderUrl}
            />
          ) : (
            <span aria-hidden="true" className="flex h-full items-center justify-center text-text-muted">
              <VideoIcon className="size-icon-lg" />
            </span>
          )}
          <span
            aria-hidden="true"
            className="absolute inset-0 flex items-center justify-center bg-scrim opacity-0 transition-opacity duration-base ease-standard group-hover:opacity-100"
          >
            <span className="flex size-icon-xl items-center justify-center rounded-full bg-surface/90 text-primary shadow-md">
              <Play className="size-icon-md" />
            </span>
          </span>
          <span className="absolute bottom-2 start-2 inline-flex items-center gap-1.5 rounded-full bg-surface/90 px-2.5 py-1 text-caption font-semibold text-text-primary backdrop-blur">
            <Play className="size-icon-sm" aria-hidden="true" />
            {t("card.watch")}
          </span>
        </div>

        <div className="flex flex-1 flex-col gap-2 p-5">
          <h3
            className="min-w-0 break-words text-body-lg font-semibold text-text-primary transition-colors duration-fast group-hover:text-primary"
            style={{ minHeight: "calc(var(--leading-body-lg) * 2em)" }}
          >
            {video.title}
          </h3>
          <p
            className="line-clamp-2 min-w-0 break-words text-body-sm text-text-secondary"
            style={{ minHeight: "calc(var(--leading-body-sm) * 2em)" }}
          >
            {video.description}
          </p>
        </div>
      </Link>
    </li>
  );
}
