import { getTranslations } from "next-intl/server";
import { Clapperboard } from "lucide-react";
import type { PaginatedResponse } from "@kira-joo/toolkit-common";
import type { LocalizedVideo } from "@/lib/domain/video";
import AppRoute from "@/constant/AppRoute.enum";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { Link } from "@/i18n/navigation";
import { VideosGrid } from "@/components/videos/videos-grid";

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
        <Reveal className="flex flex-col items-start gap-3">
          <h1 className="text-display font-extrabold text-text-primary">{t("heading")}</h1>
          <p className="max-w-narrow text-body text-text-secondary">{t("intro")}</p>
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
    <div className="flex flex-col items-center gap-3 rounded-xl border-hairline border-border bg-surface-muted px-6 py-14 text-center">
      <Clapperboard aria-hidden="true" className="size-icon-xl text-text-muted" />
      <p className="max-w-md break-words text-body-lg font-semibold text-text-primary">{t("empty.noVideos")}</p>
    </div>
  );
}

/** Real links, not buttons — a page is a distinct, shareable URL (mirrors Recipes' pagination). */
async function Pagination({ page, totalPages }: { page: number; totalPages: number }) {
  const t = await getTranslations("videos");

  const linkClass =
    "inline-flex h-control-sm items-center rounded-full border-hairline border-border bg-surface px-4 text-body-sm font-semibold text-text-primary hover:border-primary hover:text-primary";
  const disabledClass =
    "inline-flex h-control-sm items-center rounded-full border-hairline border-border px-4 text-body-sm font-semibold text-text-muted opacity-60";

  return (
    <nav aria-label={t("pagination.label")} className="mt-10 flex items-center justify-between gap-4">
      {page > 1 ? (
        <Link href={`${AppRoute.Videos}?page=${page - 1}`} className={linkClass} rel="prev">
          {t("pagination.previous")}
        </Link>
      ) : (
        <span className={disabledClass} aria-disabled="true">
          {t("pagination.previous")}
        </span>
      )}

      <span className="text-body-sm text-text-secondary">{t("pagination.page", { page, total: totalPages })}</span>

      {page < totalPages ? (
        <Link href={`${AppRoute.Videos}?page=${page + 1}`} className={linkClass} rel="next">
          {t("pagination.next")}
        </Link>
      ) : (
        <span className={disabledClass} aria-disabled="true">
          {t("pagination.next")}
        </span>
      )}
    </nav>
  );
}
