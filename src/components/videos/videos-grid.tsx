"use client";
import { useState } from "react";
import type { LocalizedVideo } from "@/lib/domain/video";
import { VideoCard } from "./video-card";

export interface VideosGridProps {
  videos: LocalizedVideo[];
}

/**
 * Portrait tiles (every real asset is a 9:16 reel-style upload, verified
 * against live data), dense on mobile and denser still on desktop — the
 * deliberate opposite of Reviews' wide editorial cards, so the two pages
 * don't read as the same grid restyled.
 *
 * Owns which single card is allowed to be playing: only a client component
 * can coordinate that across siblings, which is the one reason this whole
 * grid is a Client Component rather than each `VideoCard` sitting directly
 * in a Server Component list.
 */
export function VideosGrid({ videos }: VideosGridProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 lg:gap-6 xl:grid-cols-5">
      {videos.map((video) => (
        <VideoCard key={video._id} video={video} isActive={activeId === video._id} onActivate={() => setActiveId(video._id)} />
      ))}
    </ul>
  );
}
