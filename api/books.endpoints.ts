import type { PaginatedResponse } from "@kira-joo/toolkit-common";
import { MethodType, type Endpoint } from "@kira-joo/frontend-toolkit-core/server";
import { PublicApiRoute } from "./public-api-route";
import type { Book, PublicBookListItem } from "../src/lib/domain/book";

export const listBooksEndpoint: Endpoint<{
  query: { page?: number; limit?: number };
  returnType: PaginatedResponse<PublicBookListItem>;
}> = {
  url: PublicApiRoute.BOOKS,
  methodType: MethodType.GET,
};

export const getBookEndpoint: Endpoint<{ params: { slug: string }; returnType: Book }> = {
  url: PublicApiRoute.BOOK_DETAIL,
  methodType: MethodType.GET,
};
