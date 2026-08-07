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

const VIDEOS_PER_PAGE = 20;

/**
 * No `/videos/[id]` route exists (see that route's removal note): the
 * public API only ever exposes a paginated list — there is no public
 * single-video fetch to back a detail page — and every field a detail page
 * could show is already on each list item, so a second page would just be
 * a slower way to see the same data. The whole feature lives on this one
 * route, gallery-first.
 *
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
