import type { LocalizedVideo } from "@/lib/domain/video";
import { VideoCard } from "./video-card";

export interface VideosGridProps {
  videos: LocalizedVideo[];
  /** Only the first row of the first page should be eager (§13), mirroring RecipesBrowser. */
  isFirstPage?: boolean;
}

/**
 * Substantial landscape media cards rather than the old dense 9:16 portrait
 * tiles — a Server Component now, not a Client one: nothing plays inline
 * here anymore (every card is a real link to its detail page), so there's
 * no cross-card "which one is active" state left to coordinate.
 */
export function VideosGrid({ videos, isFirstPage = false }: VideosGridProps) {
  return (
    <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
      {videos.map((video, index) => (
        <VideoCard key={video._id} video={video} priority={isFirstPage && index < 3} />
      ))}
    </ul>
  );
}
