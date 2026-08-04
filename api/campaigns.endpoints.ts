import type { PublicEndpoint } from "../src/lib/api/public-endpoint.type";
import type { Campaign } from "../src/lib/domain/campaign";

/** 404-equivalent unless the campaign is PUBLISHED and `now` is within [startDate, endDate] — enforced server-side, not by this client. `:slug` placeholder — see public-endpoint.type.ts / build-url.ts. */
export const getCampaignEndpoint: PublicEndpoint<{ params: { slug: string }; returnType: Campaign }> = {
  url: "/api/public/campaigns/:slug",
};
