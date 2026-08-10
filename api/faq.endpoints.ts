import { MethodType, type Endpoint } from "@kira-joo/frontend-toolkit-core/server";
import { PublicApiRoute } from "./public-api-route";
import type { FaqSectionWithItems } from "../src/lib/domain/faq";

export const getFaqEndpoint: Endpoint<{ returnType: FaqSectionWithItems[] }> = {
  url: PublicApiRoute.FAQ,
  methodType: MethodType.GET,
};
