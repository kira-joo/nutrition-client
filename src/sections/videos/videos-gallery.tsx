import { getTranslations } from "next-intl/server";
import { Clapperboard } from "lucide-react";
import type { PaginatedResponse } from "@kira-joo/toolkit-common";
import type { LocalizedVideo } from "@/lib/domain/video";
import AppRoute from "@/constant/AppRoute.enum";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { VideosGrid } from "@/components/videos/videos-grid";
import { PageHeader } from "@/components/ui/page-header";
import { Reveal } from "@/components/ui/reveal";
import { EmptyPanel } from "@/components/ui/empty-panel";
import { PaginationNav } from "@/components/ui/pagination-nav";

export interface VideosGalleryProps {
  result: PaginatedResponse<LocalizedVideo>;
  page: number;
}

/**
 * The whole public surface for videos: heading, the grid (or an empty
 * state), and pagination. Deliberately no filter/search UI — with a
 * handful of short clips this is a media-first gallery, not a catalogue to
 * be narrowed (that's Recipes' job); a search box over four videos would
 * be furniture, not a feature.
 */
export async function VideosGallery({ result, page }: VideosGalleryProps) {
  const t = await getTranslations("videos");
  const totalPages = result.totalPages ?? 1;

  return (
    <Section>
      <Container>
        <Reveal>
          <PageHeader title={t("heading")} description={t("intro")} />
        </Reveal>

        <div className="mt-10">
          {result.data.length === 0 ? <EmptyVideos /> : <VideosGrid videos={result.data} isFirstPage={page === 1} />}
        </div>

        {totalPages > 1 && <Pagination page={page} totalPages={totalPages} />}
      </Container>
    </Section>
  );
}

/**
 * Its own copy and treatment (a clapperboard, not the recipes page's
 * whisk/search icons) — an empty catalogue and an empty gallery are
 * different content states and shouldn't share wording.
 */
async function EmptyVideos() {
  const t = await getTranslations("videos");

  return (
    <EmptyPanel icon={Clapperboard} message={t("empty.noVideos")} />
  );
}

/** Real links, not buttons — a page is a distinct, shareable URL (mirrors Recipes' pagination). */
async function Pagination({ page, totalPages }: { page: number; totalPages: number }) {
  const t = await getTranslations("videos");

  return (
    <PaginationNav
      page={page}
      totalPages={totalPages}
      buildHref={(target) => `${AppRoute.Videos}?page=${target}`}
      ariaLabel={t("pagination.label")}
      previousLabel={t("pagination.previous")}
      nextLabel={t("pagination.next")}
      pageLabel={t("pagination.page", { page, total: totalPages })}
      className="mt-10"
    />
  );
}
