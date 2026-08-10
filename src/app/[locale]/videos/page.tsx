import { Suspense } from "react";
import type { Locale } from "@/constant/Locale.enum";
import { getVideos } from "@/lib/data";
import { parsePage } from "@/lib/pagination/parse-page";
import { VideosGallery } from "@/sections/videos/videos-gallery";
import { VideosGallerySkeleton } from "@/sections/videos/videos-gallery-skeleton";

interface VideosPageProps {
  params: { locale: Locale };
  searchParams: Record<string, string | string[] | undefined>;
}

// Fewer per page than the old dense 9:16 grid used (20): these are large
// landscape cards now, and each one links through to its own real
// `/videos/[id]` route (see that route) rather than trying to show
// everything at once on the listing.
const VIDEOS_PER_PAGE = 9;

/**
 * The `Suspense` boundary (rather than a sibling `loading.tsx`) replays the
 * skeleton per page number, matching the Recipes page's rationale.
 */
export default function VideosPage({ params, searchParams }: VideosPageProps) {
  const page = parsePage(searchParams.page);

  return (
    <Suspense key={page} fallback={<VideosGallerySkeleton />}>
      <VideosResults locale={params.locale} page={page} />
    </Suspense>
  );
}

async function VideosResults({ locale, page }: { locale: Locale; page: number }) {
  const result = await getVideos(locale, { page, limit: VIDEOS_PER_PAGE });
  return <VideosGallery result={result} page={page} />;
}
