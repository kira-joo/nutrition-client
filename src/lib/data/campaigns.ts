import { localize, type LocalizedLocale } from "@kira-joo/toolkit-common";
import { nullableOnNotFound } from "@kira-joo/frontend-toolkit-core/server";
import { getActiveCampaignEndpoint, getCampaignEndpoint } from "../../../api/campaigns.endpoints";
import { fetchPublic } from "@/lib/api/fetch-public";
import { CacheTag } from "@/lib/cache/cache-tags";
import type { Campaign, LocalizedCampaign } from "@/lib/domain/campaign";

/** Returns `null` for an unpublished/expired/nonexistent slug (the backend makes these indistinguishable on purpose) rather than throwing, so the calling page decides whether to call notFound(). */
export async function getCampaign(slug: string, locale: LocalizedLocale): Promise<LocalizedCampaign | null> {
  const raw = await nullableOnNotFound<Campaign>(() =>
    fetchPublic(getCampaignEndpoint, {
      params: { slug },
      tags: [CacheTag.CAMPAIGNS, CacheTag.campaign(slug)],
    })
  );
  return raw && localize(raw, locale);
}

/**
 * Resolves `SiteSettings.activeCampaignId` server-side (`GET
 * /api/public/active-campaign`) rather than this app ever translating a raw
 * Mongo id into a slug itself. Returns `null` when no campaign is
 * configured, or the configured one isn't currently published/in-range —
 * same indistinguishable-404 contract as `getCampaign`, so a homepage
 * banner just checks for `null` rather than branching on why.
 *
 * No entity-level `campaign(slug)` tag here (the slug isn't known until
 * after the fetch resolves) — the domain-level `CAMPAIGNS` tag alone still
 * gives this the same 300s fallback interval as every other campaign read,
 * which is what actually matters for a value that can flip purely from
 * wall-clock time.
 */
export async function getActiveCampaign(locale: LocalizedLocale): Promise<LocalizedCampaign | null> {
  const raw = await nullableOnNotFound<Campaign>(() => fetchPublic(getActiveCampaignEndpoint, { tags: [CacheTag.CAMPAIGNS] }));
  return raw && localize(raw, locale);
}
