import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { SITE_ORIGIN } from "@/lib/config/site-origin.constant";
import { getActiveCampaign, getRecipes } from "@/lib/data";
import { RECIPES_PER_PAGE } from "@/lib/recipes/recipe-search-params";
import { appHref } from "@/constant/AppRoute.enum";
import type { LocalizedLocale } from "@kira-joo/toolkit-common";

/**
 * Fixed, always-real routes. Deliberately excludes `/newsletter` and
 * `/resources` — both were already marked for removal in the original
 * project plan (no CMS model backs either, `/newsletter` is a total
 * no-op) and never linked from anywhere live; submitting them to search
 * engines would be actively counterproductive regardless of whether their
 * removal has happened yet.
 */
const FIXED_PATHS = ["/", "/doctor", "/packages", "/recipes", "/reviews", "/videos", "/faq", "/consultation"];

function urlFor(locale: string, path: string) {
  return `${SITE_ORIGIN}/${locale}${path === "/" ? "" : path}`;
}

/** Every recipe id, across every page — the catalogue is small enough that looping to `totalPages` costs a handful of requests, not a real performance concern for a build-time sitemap. */
async function fetchAllRecipeIds(locale: LocalizedLocale): Promise<string[]> {
  const ids: string[] = [];
  let page = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const result = await getRecipes(locale, { page, limit: RECIPES_PER_PAGE });
    ids.push(...result.data.map((recipe) => recipe._id));
    const totalPages = result.totalPages ?? 1;
    if (page >= totalPages) break;
    page += 1;
  }
  return ids;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  for (const path of FIXED_PATHS) {
    for (const locale of routing.locales) {
      entries.push({ url: urlFor(locale, path), changeFrequency: "weekly", priority: path === "/" ? 1 : 0.7 });
    }
  }

  // Recipe ids are locale-independent (the same document, resolved per
  // locale at render time) — fetched once against the default locale
  // purely to get the id list, then emitted for every locale.
  const recipeIds = await fetchAllRecipeIds(routing.defaultLocale);
  for (const id of recipeIds) {
    for (const locale of routing.locales) {
      entries.push({ url: urlFor(locale, appHref.recipe(id)), changeFrequency: "monthly", priority: 0.6 });
    }
  }

  // Only ever the currently-active campaign — there is no listing
  // endpoint to enumerate past/future campaigns, and a campaign's
  // relevance is inherently time-boxed anyway.
  const activeCampaign = await getActiveCampaign(routing.defaultLocale).catch(() => null);
  if (activeCampaign) {
    for (const locale of routing.locales) {
      entries.push({ url: urlFor(locale, appHref.campaign(activeCampaign.slug)), changeFrequency: "daily", priority: 0.8 });
    }
  }

  return entries;
}
