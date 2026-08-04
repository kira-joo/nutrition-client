/**
 * Local reimplementation of frontend-toolkit-core's `Endpoint`/
 * `EndpointParams`/`EndpointQuery`/`EndpointReturn` shape — pure type
 * aliases, zero runtime code, so this file itself is always safe to
 * import anywhere. It exists because the READ-ONLY public endpoints
 * (api/site-settings.endpoints.ts, api/recipes.endpoints.ts, etc.) are
 * consumed only by `fetchPublic` — never by `requester`/
 * `useRequesterMutation` — so they don't need frontend-toolkit-core's
 * actual `Endpoint` type, and defining them against it would require also
 * importing its real `MethodType` enum (a value), which crashes Next's
 * page-data-collection build step for any page/route that transitively
 * imports it (confirmed during Phase 4 verification — see
 * src/lib/api/build-url.ts's comment for the full story).
 *
 * `api/consultation-requests.endpoints.ts`'s CLIENT-facing endpoint
 * (`createConsultationRequestEndpoint`) is the one exception — it's used
 * with the real `requester`/`useRequesterMutation` from a "use client"
 * file, where the barrel import is safe, so it correctly uses
 * frontend-toolkit-core's actual `Endpoint`/`MethodType`.
 */
export interface PublicEndpointSchema {
  params?: Record<string, unknown>;
  query?: Record<string, unknown>;
  returnType?: unknown;
}

export interface PublicEndpoint<TSchema extends PublicEndpointSchema = PublicEndpointSchema> {
  url: string;
  readonly _schema?: TSchema;
}

export type PublicEndpointParams<TEndpoint extends PublicEndpoint> =
  TEndpoint extends PublicEndpoint<infer TSchema> ? (NonNullable<TSchema> extends { params: infer TParams } ? TParams : never) : never;

export type PublicEndpointQuery<TEndpoint extends PublicEndpoint> =
  TEndpoint extends PublicEndpoint<infer TSchema> ? (NonNullable<TSchema> extends { query: infer TQuery } ? TQuery : never) : never;

export type PublicEndpointReturn<TEndpoint extends PublicEndpoint> =
  TEndpoint extends PublicEndpoint<infer TSchema> ? (NonNullable<TSchema> extends { returnType: infer TReturn } ? TReturn : unknown) : unknown;
