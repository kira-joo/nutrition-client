import { MethodType, type Endpoint } from "@kira-joo/frontend-toolkit-core/server";
import { PublicApiRoute } from "./public-api-route";
import type { Campaign } from "../src/lib/domain/campaign";

/** 404-equivalent unless the campaign is PUBLISHED and `now` is within [startDate, endDate] — enforced server-side, not by this client. */
export const getCampaignEndpoint: Endpoint<{ params: { slug: string }; returnType: Campaign }> = {
  url: PublicApiRoute.CAMPAIGN_DETAIL,
  methodType: MethodType.GET,
};

/** Same 404-equivalent contract as `getCampaignEndpoint`, but resolves `SiteSettings.activeCampaignId` server-side instead of taking a slug — see `PublicApiRoute.ACTIVE_CAMPAIGN`'s doc comment. */
export const getActiveCampaignEndpoint: Endpoint<{ returnType: Campaign }> = {
  url: PublicApiRoute.ACTIVE_CAMPAIGN,
  methodType: MethodType.GET,
};
