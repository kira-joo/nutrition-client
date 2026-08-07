import { localize, type LocalizedLocale } from "@kira-joo/toolkit-common";
import { nullableOnNotFound } from "@kira-joo/frontend-toolkit-core/server";
import { getCampaignEndpoint } from "../../../api/campaigns.endpoints";
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
