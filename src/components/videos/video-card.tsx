import Image from "next/image";
import { useTranslations } from "next-intl";
import { Play, Video as VideoIcon } from "lucide-react";
import type { LocalizedVideo } from "@/lib/domain/video";
import { Link } from "@/i18n/navigation";
import { appHref } from "@/constant/AppRoute.enum";
import { MediaPill } from "@/components/ui/media-pill";
import { SURFACE_RAISED, SURFACE_HOVER_ELEVATION } from "@/components/ui/surface";
import { cn } from "@/lib/cn";
import { PlayOverlay } from "@/components/videos/play-overlay";

export interface VideoCardProps {
  /**
   * Semantic depth only — the heading's visual size is the card's design and does
   * not move with it. `h3` is right under a section heading, as on the homepage
   * previews; a browse page whose own `h1` is the nearest heading above the grid
   * passes `h2`, because skipping a level makes the document outline claim a
   * nesting that isn't there.
   */
  headingLevel?: "h2" | "h3";
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
export function VideoCard({ headingLevel: Heading = "h3", video, priority = false }: VideoCardProps) {
  const t = useTranslations("videos");
  // Staff-chosen override first, then the poster Cloudinary derives for an
  // uploaded video (VideoAsset.posterUrl) — never a synthesized still frame.
  const posterUrl = video.poster?.secureUrl ?? video.video?.posterUrl ?? undefined;

  return (
    <li className="flex">
      <Link
        href={appHref.video(video._id)}
        className={cn("group flex h-full w-full flex-col overflow-hidden", SURFACE_RAISED, SURFACE_HOVER_ELEVATION)}
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
          <PlayOverlay />
          <MediaPill position="bottom-start" icon={<Play className="size-icon-sm" aria-hidden="true" />}>
            {t("card.watch")}
          </MediaPill>
        </div>

        <div className="flex flex-1 flex-col gap-2 p-5">
          <Heading
            className="min-w-0 break-words text-body-lg font-semibold text-text-primary transition-colors duration-fast group-hover:text-primary"
            style={{ minHeight: "calc(var(--leading-body-lg) * 2em)" }}
          >
            {video.title}
          </Heading>
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
