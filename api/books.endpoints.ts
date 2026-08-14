import { MethodType, type Endpoint } from "@kira-joo/frontend-toolkit-core/server";
import { PublicApiRoute } from "./public-api-route";
import type { Book } from "../src/lib/domain/book";

export const getBookEndpoint: Endpoint<{ params: { slug: string }; returnType: Book }> = {
  url: PublicApiRoute.BOOK_DETAIL,
  methodType: MethodType.GET,
};
