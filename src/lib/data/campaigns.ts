import { getCampaignEndpoint } from "../../../api/campaigns.endpoints";
import { fetchPublic } from "@/lib/api/fetch-public";
import { CacheTag } from "@/lib/cache/cache-tags";
import type { Campaign } from "@/lib/domain/campaign";
import { nullableOnNotFound } from "@kira-joo/frontend-toolkit-core/server";

/** Returns `null` for an unpublished/expired/nonexistent slug (the backend makes these indistinguishable on purpose) rather than throwing, so the calling page decides whether to call notFound(). */
export async function getCampaign(slug: string): Promise<Campaign | null> {
  return nullableOnNotFound(() =>
    fetchPublic(getCampaignEndpoint, {
      params: { slug },
      tags: [CacheTag.CAMPAIGNS, CacheTag.campaign(slug)],
    })
  );
}
