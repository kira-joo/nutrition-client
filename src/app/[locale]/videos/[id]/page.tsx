import { notFound } from "next/navigation";
import type { Locale } from "@/constant/Locale.enum";
import { getVideo } from "@/lib/data";
import { VideoDetail } from "@/sections/videos/video-detail";

interface VideoDetailPageProps {
  params: { locale: Locale; id: string };
}

/** A Mongo ObjectId is exactly 24 hex characters; nothing else can identify a video — mirrors the recipe detail route's guard. */
const OBJECT_ID = /^[0-9a-f]{24}$/i;

/**
 * `getVideo` returns null for a genuine 404 rather than throwing, so an
 * unknown or unpublished id becomes a real not-found page instead of the
 * generic error boundary. A malformed id is rejected before the request
 * (the API would otherwise answer with a 400, surfacing as a 500 "this
 * page didn't load" for what is really just a mistyped URL).
 */
export default async function VideoDetailPage({ params }: VideoDetailPageProps) {
  if (!OBJECT_ID.test(params.id)) notFound();

  const video = await getVideo(params.id, params.locale);
  if (!video) notFound();

  return <VideoDetail video={video} />;
}
