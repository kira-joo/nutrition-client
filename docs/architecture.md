# nutrition-client architecture

High-level map of how the app is wired together, kept up to date as each
rewrite phase lands. For the visual design system, see
[`design-system.md`](./design-system.md) and [`theme.md`](./theme.md).

## Routing

Every route lives under `src/app/[locale]/**` — there is no separate root
layout outside the locale segment (`src/app/[locale]/layout.tsx` renders
the `<html>`/`<body>` tags directly). `src/middleware.ts` handles locale
routing via next-intl's `createMiddleware`, configured by
[`src/i18n/routing.ts`](../src/i18n/routing.ts) — the one place the app's
supported locales (`ar`, `en`) and default locale (`ar`) are declared.

All pages are still client components rendering fully dynamically (no
static generation anywhere yet — see "Static rendering" below for why
that's a deliberate non-goal of this phase).

## Public data flow

Phase 4's layer — nutrition-staff is the single backend for every piece of
CMS content and the one public mutation. Nothing here builds page UI yet
(that's Phase 6); this is the data/API layer pages will consume. Revised
after Phase 4's approval to make the toolkit ecosystem, not this app, the
default home for anything generic (see "Package-first architecture"
below).

### Layers, browser to database

```
Server Component (a future page)
  -> src/lib/data/*.ts        (one function per domain, e.g. getRecipe(id))
    -> src/lib/api/fetch-public.ts   (tagged, cached fetch)
      -> ServerApiConfig.baseURL      (API_URL, owns nutrition-staff's /api prefix)
        -> nutrition-staff's /api/public/* (read-only GET)

Client Component (a future consultation form)
  -> src/lib/mutations/use-consultation-request.ts   (useRequesterMutation)
    -> APIConfig.baseURL = "/api" (same-origin, owns this app's own /api prefix)
      -> this app's own /api/consultation-requests    (Route Handler, proxy)
        -> ServerApiConfig.baseURL (API_URL)
          -> nutrition-staff's /api/public/consultation-requests (POST)
```

The browser never talks to nutrition-staff directly, in either direction —
reads happen server-side (Server Components), and the one write goes
through this app's own proxy route. nutrition-staff has no CORS support at
all today, so this isn't an optimization, it's the only way either path
works.

### Domain inventory

| Domain | Data function(s) | Endpoint(s) | Shape |
|---|---|---|---|
| Site Settings | `getSiteSettings()` | `GET /api/public/site-settings` | singleton |
| Doctor Profile | `getDoctorProfile()` | `GET /api/public/doctor-profile` | singleton |
| Packages Page Settings | `getPackagesPageSettings()` | `GET /api/public/packages-page-settings` | singleton |
| Packages | `getPackages()` | `GET /api/public/packages` | unpaginated array |
| Recipe taxonomy | `getRecipeCategories()`, `getRecipeFoodGroups()` | `GET /api/public/recipe-categories`, `/recipe-food-groups` | unpaginated arrays |
| Recipes | `getRecipes(params)`, `getRecipe(id)` | `GET /api/public/recipes`, `/recipes/:id` | paginated list + detail |
| Reviews | `getReviews(params)` | `GET /api/public/reviews` | paginated list (no detail endpoint) |
| Videos | `getVideos(params)` | `GET /api/public/videos` | paginated list (no detail endpoint) |
| FAQ | `getFaqSectionsWithItems()` | `GET /api/public/faq` | sections with items already joined, ordered, published-filtered |
| Campaigns | `getCampaign(slug)` | `GET /api/public/campaigns/:slug` | single, time-gated |
| Consultation | `useConsultationRequest()` | `POST /api/consultation-requests` (proxy) → nutrition-staff's `/api/public/consultation-requests` | mutation |

All 8 read domains and the consultation proxy were verified against a real
running nutrition-staff instance and real MongoDB data — see
"Verification" below.

### Package-first architecture

Standing rule for this codebase, not just a one-time cleanup: before
writing any generic (non-nutrition-specific) helper, hook, mapping
function, or server/client abstraction, check whether
`@kira-joo/frontend-toolkit-core` or `@kira-joo/toolkit-common` already
provides it. If it does, consume it directly. If it's genuinely generic
and doesn't exist yet, it belongs in the toolkit — implemented there,
documented, exported, and consumed back — not built locally "for now."
Code stays in this app only when it's genuinely nutrition-specific (cache
tag values, domain types, the CMS-to-content mapping layer) or a thin
glue layer between a toolkit primitive and an app-specific choice (e.g.
next-intl).

Concretely promoted into the toolkit ecosystem during this pass, all
consumed back from the published package rather than duplicated:
- `resolveLocalized`/`isLocalizedFallback` → `@kira-joo/toolkit-common`
  (pure `LocalizedString` display-side logic, zero framework dependency —
  see "CMS content vs. UI copy" below).
- `AppError`/`isAppError`/`toAppError`/`isNotFoundError`/
  `nullableOnNotFound` → `@kira-joo/frontend-toolkit-core` (built directly
  on that package's own `classifyApiError`/`normalizeApiError`/
  `isApiError` — see "Error model" below).
- `joinUrl` → `@kira-joo/frontend-toolkit-core` (extracted from
  `requester`'s own internal implementation into a named export —
  `requester` now consumes the same exported function instead of a
  private copy — see "Base URL and route composition" below).
- `createCachePolicyResolver` → `@kira-joo/frontend-toolkit-core` (the
  tag→revalidate-seconds lookup *mechanism*; the concrete tags/intervals
  stay local — see "Caching" below).
- `createLazyEnvBaseUrlConfig` → `@kira-joo/frontend-toolkit-core` (the
  lazy-env-var-config *pattern*; see "Base URL and route composition").

What stays local, and why: `CacheTag`'s concrete string values and
`CACHE_POLICY`'s concrete intervals (nutrition-specific business
contracts — the toolkit packages must stay reusable across unrelated
projects and carry no nutrition domain knowledge), every `domain/*.ts`
type (mirrors nutrition-staff's actual response shapes), `PublicApiRoute`
(this app's own route registry), and `use-resolve-localized.ts`'s
`"use client"` wrapper (glues toolkit-common's pure functions to
next-intl's `useLocale()`, an app-specific i18n library choice the
toolkit shouldn't assume).

### Endpoint definitions (`api/*.endpoints.ts`)

Same convention as nutrition-staff's own frontend (`api/site-settings.
endpoints.ts` there): one file per domain under a top-level `api/`
directory (sibling to `src/`, not inside it), each exporting named
endpoint constants against frontend-toolkit-core's real `Endpoint`/
`MethodType` — no separate local `Endpoint`-shaped type anymore (see "The
barrel-import build bug, and its real fix" below for why an earlier
revision of this phase needed one). No data function or route handler
ever hardcodes a path string; every `url` reads from `api/public-api-route.ts`.

Two import sources, matched to execution context:
- The 8 read-only domains import `Endpoint`/`MethodType` from
  frontend-toolkit-core's `./server` subpath (consumed by `fetchPublic`,
  which runs only in Server Components/Route Handlers).
- `createConsultationRequestEndpoint` imports from the root package
  (consumed by `requester`/`useRequesterMutation` from a `"use client"`
  file).

Placeholder syntax is `:id`/`:slug`, not `[id]`/`[slug]` — matching
frontend-toolkit-core's actual `buildUrl` convention (bracket syntax would
silently never match anything).

### The barrel-import build bug, and its real fix

`@kira-joo/frontend-toolkit-core`'s root entry point bundles React-context
code (`AuthUserProvider`/`QueryParamsRouterProvider`/`ToolkitProviders`)
together with everything else into one file. Server Components and Route
Handlers resolve `react` through the "react-server" condition, which
doesn't export `createContext` — so importing *anything* from that bundle,
even a plain enum like `MethodType`, crashed Next's "Collecting page data"
build step with `TypeError: createContext is not a function`, for both
Route Handlers and ordinary Server Component pages.

**The actual fix, landed in `frontend-toolkit-core` 0.5.0**: a second,
genuinely separate build entry point, `@kira-joo/frontend-toolkit-core/server`
— a distinct bundle (`tsup`'s multi-entry output) containing only
React-free modules (`APIConfig`, `requester`, `buildUrl`/`joinUrl`,
`MethodType`/`ContentType`, `Endpoint` and friends, `AppError`/
`nullableOnNotFound`, `createCachePolicyResolver`,
`createLazyEnvBaseUrlConfig`, and more) — never bundled alongside the
context/provider code, so importing it can't pull that code in even
transitively. This app now imports every server-side toolkit value from
that subpath (`fetch-public.ts`, `server-api-config.ts`, `cache-policy.ts`,
every read-only `api/*.endpoints.ts` file, the consultation proxy Route
Handler); Client Components keep importing the root package, which still
carries the context/provider code they actually need.

The four local reimplementations an earlier revision of this phase built
as a stopgap (`build-url.ts`, `normalize-api-error.ts`,
`classify-api-error.ts`, `public-endpoint.type.ts`) have all been deleted
— every call site now consumes the real functions/types from `./server`
directly. `type`-only imports from the root package were always safe
(erased at compile time); the fix is specifically about real value
imports.

### Base URL and route composition

One rule, applied on both the client and server side: **a base URL owns
the shared `/api` prefix; a route constant owns only the resource path —
never both, never neither.**

- `ServerApiConfig` (`src/lib/api/server-api-config.ts`) —
  `createLazyEnvBaseUrlConfig()` from frontend-toolkit-core's `./server`
  subpath, called with **no arguments**: this app has exactly one upstream
  backend, so it uses the helper's default env var (`API_URL`) and default
  hint (`"see .env.example"`) rather than overriding them. `API_URL`
  includes nutrition-staff's `/api` prefix (e.g.
  `"https://staff.example.com/api"`); `api/public-api-route.ts`'s
  `PublicApiRoute` constants are resource paths only (e.g.
  `"/public/site-settings"`).
- `APIConfig.baseURL` (`api-config.ts`) is set to `"/api"` — this app's
  OWN same-origin `/api` prefix. `PublicApiRoute.CONSULTATION_REQUESTS` is
  just `"/consultation-requests"`.
- Both sides join their base URL and route constant via
  frontend-toolkit-core's `joinUrl` — **never** `new URL(path, base)`. The
  latter treats a leading-`/` `path` as replacing the base's entire path
  (keeping only its origin): `new URL("/public/x", "https://host/api")`
  resolves to `"https://host/public/x"`, silently dropping `/api`. This
  was a real bug caught during this pass, before `API_URL` ever had a path
  segment to lose — the old base URL (`STAFF_API_BASE_URL`, origin-only,
  no path) never exposed it, but adding an owned prefix in the same base
  URL would have hit it immediately without the switch to `joinUrl`.
  `requester` (used by the client-side consultation mutation) has always
  joined this way internally; `fetchPublic` and the consultation proxy
  Route Handler now call the same exported `joinUrl` explicitly.

`ServerApiConfig.baseURL` resolves lazily (on first read, not at
module-import time) specifically so a build environment where `API_URL`
genuinely isn't set until runtime doesn't fail `next build` itself.

### Caching

Two concerns, two files, deliberately not merged:
- `src/lib/cache/cache-tags.ts` — the tag **taxonomy** (`CacheTag.
  SITE_SETTINGS`, `CacheTag.recipe(id)`, etc.). Project-specific business
  contract, not toolkit material — nutrition-staff will own a matching
  copy of the same string values for its Phase 5 revalidation trigger, as
  two intentionally separate project-level definitions, not a shared
  package (the toolkit packages stay reusable across unrelated projects
  and must not carry nutrition-domain knowledge).
- `src/lib/cache/cache-policy.ts` — the revalidation **policy**
  (`CACHE_POLICY`, keyed by the static tags). Stable CMS content defaults
  to `DEFAULT_REVALIDATE_SECONDS` (one day) — on-demand invalidation
  (Phase 5) is meant to be the primary freshness mechanism, so this is
  genuinely a fallback, not a target staleness window. Campaigns are the
  one deliberate exception at 300s, since a campaign's visibility can flip
  from valid to invalid purely from wall-clock time crossing `endDate`,
  with zero underlying data change to trigger on-demand invalidation at
  all.

`resolvePolicyRevalidate` (the `tags[0]` → interval lookup) is now built
from frontend-toolkit-core's `createCachePolicyResolver(policy,
defaultSeconds)` — a generic mechanism the toolkit provides; `CACHE_POLICY`
itself, with its concrete nutrition-specific tags and intervals, stays
local. `fetchPublic` derives `revalidate` from `tags[0]` automatically via
this resolver — ordinary data functions only ever pass `tags`, never
`revalidate`, unless a call genuinely needs to deviate from policy.
Convention for multi-tag calls: the **first** tag is always the
policy/domain tag; any further tags are entity-level and participate in
invalidation only (e.g. `[CacheTag.RECIPES, CacheTag.recipe(id)]` — busts
either the whole list or just that one recipe's detail page, and the
policy lookup always uses `RECIPES`).

### Error model

One shape, `AppError`, imported directly from
`@kira-joo/frontend-toolkit-core` (root) /`./server` (server-side) — no
local `error-model.ts` anymore, since the toolkit now ships this exact
shape: `{__isAppError, category, message, statusCode?, validationErrors?,
cause}`. `category` is one of the categories frontend-toolkit-core's
`classifyApiError` produces (`notFound`, `validation`, `network`, etc.) —
components in a later phase branch on `category`, never on a raw status
code or a parsed response body directly.

`nullableOnNotFound(fn)`, also from the toolkit, is the one place "a 404
becomes `null`, everything else rethrows" lives — `getRecipe`/
`getCampaign` both use it instead of repeating their own try/catch. It
never calls Next's `notFound()` itself; a data function isn't the right
layer to make a navigation decision — the calling page decides what `null`
means (a 404, an empty state, something else).

**A real classification bug, caught during verification and fixed
upstream in the toolkit's `isApiError`/`toAppError` docs**: `isApiError`'s
check (`"message" in error`) is loose enough that a plain `Error` instance
satisfies it too — `fetchPublic` originally constructed
`new Error("Request failed with status 404")` to pass into `toAppError`
alongside the real `Response`, and that plain `Error` got mistaken for an
already-normalized `ApiError`, skipping `normalizeApiError` (and the real
`Response`) entirely — every failed request came out classified as
`"network"` regardless of its actual status. Fixed by passing `null`
instead (`normalizeApiError` never reads its first argument once a
`response` is provided, so there's nothing to lose). A genuine 404 and a
genuine 400 validation error were both re-verified against the live
backend afterward to confirm the fix.

### CMS content vs. UI copy stay separate systems (recap)

`resolveLocalized(value, locale)`/`isLocalizedFallback(value, locale)` now
live in `@kira-joo/toolkit-common` — the display-side counterpart to that
package's `isLocalizedComplete`/`findIncompleteLocalizedPaths` (which gate
*publishing*, not *display*), resolving a CMS `LocalizedString` `{ar, en}`
to a plain string with an honest fallback to the other locale when the
requested one is empty. `useResolveLocalized()`
(`src/lib/i18n/use-resolve-localized.ts`) is this app's own thin,
genuinely `"use client"` wrapper for Client Components that don't want to
re-pass `locale` on every call — it wraps toolkit-common's functions via
next-intl's `useLocale()`, it doesn't duplicate their logic. Server
Components call `resolveLocalized`/`isLocalizedFallback` directly from
`@kira-joo/toolkit-common`, passing the locale from the route param.

(This was originally a local file, and briefly lived under a `"use
client"` directive that broke calling it from Server Components — a plain
function exported from a `"use client"` module becomes a client reference
a Server Component can't call directly. Moving it to toolkit-common
removed the local file and the class of bug with it.)

This stays a fundamentally different system from next-intl's UI-copy
translation (`useI18n`/`useTranslations`): CMS content is live data fetched
per-request; UI copy is versioned with the app and known at build time.
Neither should route through the other's mechanism.

### FAQ: joined and ordered server-side

`getFaqSectionsWithItems()` is a single `GET /api/public/faq` call —
nutrition-staff joins sections with their items, applies the
staff-authored `order` field, and filters to published-only, all
server-side (`getPublicFaq()` in nutrition-staff's `src/server/faq/`).
This replaced an earlier two-endpoint shape (`/api/public/faq-sections` +
`/api/public/faq-items`, joined and sorted client-side via a
`groupFaqItemsBySection` helper) — grouping/ordering/filtering published
content is backend business logic, not frontend presentation logic, so it
shouldn't be repeated by every frontend consumer nutrition-staff ever
grows. The public response shape (`FaqSectionWithItems`/`FaqItem` in
`src/lib/domain/faq.ts`) deliberately excludes `order`/`status`/
`createdAt`/`updatedAt` — fields the admin CRUD shape carries but the
public site never renders.

### Verification

Real, not simulated: a local nutrition-staff instance was run against its
actual MongoDB data (a temporary Server Component page exercised the data
functions directly each time, since no real page consumes this layer yet
— Phase 6 builds that; deleted after each check). Confirmed:
- Every one of the 8 read domains returns real data, in both `ar` and
  `en`, including a genuine partial-translation case (`site-settings`'s
  `defaultSeo.description.en` is empty in the live database) correctly
  falling back to the populated locale rather than rendering blank.
- `getRecipe`/`getCampaign` both return `null` (not a thrown error, not a
  crash) for a real 404/expired-or-nonexistent slug.
- A genuine validation error (`GET .../recipes/not-a-valid-id`) classifies
  correctly as `"validation"` with the real `{field, message}` array from
  nutrition-staff's response.
- The consultation-requests proxy was posted to directly and confirmed to
  round-trip through to nutrition-staff and back with a real `{success:
  true}` response.
- After introducing `API_URL`'s owned `/api` prefix and switching to
  `joinUrl`, `getSiteSettings()` and the consultation proxy were both
  re-verified against the real backend to confirm the resolved request URL
  was correct (no dropped/duplicated `/api` segment).
- `getFaqSectionsWithItems()` was re-verified against the new composed
  `/api/public/faq` endpoint: sections return correctly ordered
  (`["Section 1", "Section 2"]`, matching the CMS-authored `order` — the
  same underlying data that, before this endpoint existed, came back from
  the two old flat endpoints as `["Section 2", "Section 1"]`) with items
  correctly nested.
- A dormant Phase 3 regression, found and fixed during this phase's
  original pass: the `faq` UI-copy namespace (`src/i18n/locales/*/
  faq.json`) stored flat keys with literal dots (`"section1.q1.question"`)
  instead of nested objects, which next-intl rejects outright
  (`INVALID_KEY`) — restructured into proper nested JSON.

## On-demand cache invalidation

Phase 5's layer. The fallback `revalidate` intervals from "Caching" above
are a ceiling on staleness, not the primary freshness mechanism — a
mutating route on nutrition-staff tells this app to bust the relevant
cache tag immediately after a successful write, so an edit shows up on
the public site right away instead of waiting out the fallback window.

```
nutrition-staff mutating route (e.g. PUT /api/recipes/:id)
  -> write succeeds
    -> revalidateRecipes(id)  (src/server/core/revalidation/revalidate-entity.ts)
      -> publishRevalidation([CacheTag.RECIPES, CacheTag.recipe(id)])
        -> POST <NUTRITION_CLIENT_URL>/api/revalidate  (Bearer REVALIDATE_SECRET)
          -> this app's src/app/api/revalidate/route.ts
            -> revalidateTag(tag) for each tag  (next/cache)
```

### The receiving route (`src/app/api/revalidate/route.ts`)

Authenticates with a constant-time comparison (`crypto.timingSafeEqual`)
against `Bearer <REVALIDATE_SECRET>` — a plain `===` would leak timing
information about how many leading characters of the secret matched. Calls
`revalidateTag()` once per tag in the request body; unknown/malformed
input (non-array `tags`, non-string entries) is filtered out rather than
rejected with an error, since a partially-valid request should still bust
whatever tags it did send correctly. Never called from the browser —
`REVALIDATE_SECRET` is a server-only env var shared only with
nutrition-staff.

### The sending side (nutrition-staff)

- `src/server/core/revalidation/cache-tag.ts` — mirrors this app's
  `CacheTag` string values exactly (see "Caching" above for why this stays
  a hand-kept-in-sync duplicate, not a shared package).
- `src/server/core/revalidation/publish-revalidation.ts` —
  `publishRevalidation(tags)`, the one function that actually POSTs to
  `<NUTRITION_CLIENT_URL>/api/revalidate`. Awaited, not fire-and-forget
  (genuine detached fire-and-forget is unsafe on serverless — the function
  can freeze the instant a response is sent, with no guarantee an
  unawaited promise ever completes), but bounded by a hard 2.5s
  `AbortController` timeout, and every failure is swallowed rather than
  rethrown: a slow or unreachable nutrition-client must never fail the
  write that triggered it. A no-op when `NUTRITION_CLIENT_URL`/
  `REVALIDATE_SECRET` aren't configured (e.g. local development with no
  nutrition-client instance running).
- `src/server/core/revalidation/revalidate-entity.ts` — one thin function
  per public-facing entity (`revalidateRecipes`, `revalidateCampaigns`,
  etc.), each naming exactly the tags that entity's routes need to bust,
  instead of every route repeating the tag list. `revalidateRecipes(id)`/
  `revalidateCampaigns(slug)` take an optional detail-page identifier,
  mirroring this app's multi-tag convention; omitted for a create (no
  detail page exists yet) or a list-only change.
- Wired into all 38 mutating routes across the 12 public-facing entities —
  every `POST`/`PUT`/`DELETE` under `src/app/api/{site-settings,
  doctor-profile,doctor-profile/gallery,packages-page-settings,packages,
  recipe-categories,recipe-food-groups,recipes,reviews,videos,
  faq-sections,faq-items,campaigns}/**` calls its entity's `revalidate*`
  function immediately after the write succeeds. `faq-sections` and
  `faq-items` both call `revalidateFaq()` — nutrition-client's composed
  `GET /api/public/faq` reads from both collections under that one tag.
  Campaign `PUT`/`DELETE` and every `blocks/**` mutation revalidate the
  campaign's `slug`-derived tag (read from the mutation's own return value
  — every block handler already returns the updated campaign document);
  `PUT` additionally revalidates the *previous* slug unconditionally,
  since `slug` itself is updatable and an old cached detail page must not
  linger stale under a slug the campaign no longer uses.

### Verification

Real, not simulated — but scoped to what was reachable without a real
nutrition-staff admin account (the live database has no seeded/known test
credentials; guessing or bypassing auth was not attempted). What was
verified directly, end to end, with both apps actually running:
- **Cache hit within the fallback window**: a temporary debug page called
  `getRecipes()` (tagged `CacheTag.RECIPES`). The first request produced a
  real `GET /api/public/recipes` line in nutrition-staff's dev server log
  (cache miss); an immediate second request produced *no* new line at all
  (cache hit, served entirely from Next's Data Cache, zero requests
  reaching nutrition-staff).
- **The receiving route**: direct `POST /api/revalidate` calls confirmed
  200 + `{revalidated:true,tags:[...]}` with the correct
  `Bearer <REVALIDATE_SECRET>`, and 401 for both a wrong secret and a
  missing header.
- **The full on-demand loop**: after calling `/api/revalidate` with tag
  `"recipes"`, the next request to the debug page produced a **new**
  `GET /api/public/recipes` line in nutrition-staff's log — proof
  `revalidateTag()` genuinely evicted the specific Data Cache entry, not
  just that the endpoint returned 200.
- **The sending side, independently**: `publishRevalidation` was invoked
  directly (a real script, real env vars, real running nutrition-client)
  and confirmed to complete without throwing.
- **Resilience**: with nutrition-client killed, the same direct
  `publishRevalidation` call resolved in ~0.1s (immediate `ECONNREFUSED`,
  well under the 2.5s timeout) and did not throw — a down/unreachable
  nutrition-client cannot fail or block a nutrition-staff write.
- **Not independently curled**: an actual authenticated `PUT`/`POST`/
  `DELETE` through nutrition-staff's real HTTP routes (which would prove
  the exact wired call site executes at request time, not just that its
  two halves work correctly in isolation) — this requires real admin
  credentials this environment doesn't have. Every route's wiring was
  written directly against, and typechecked/built against, the same
  `revalidate*`/`publishRevalidation` functions verified above.

## Localization & RTL

This is the infrastructure Phase 3 replaced wholesale. Nothing here is
i18next anymore.

### Library

**next-intl**, not i18next/react-i18next. The old `src/i18n/index.ts`
(eager `require()` of every locale JSON file into one i18next `init()`
call) is gone, along with `src/hooks/useRTL.ts`, `src/types/i18n.d.ts`
(the old `TranslationKeyMap`/`NestedKeyOf` system), and
`src/utils/Provider/LanguageProvider.tsx`.

Why the switch: i18next's eager-load pattern shipped every locale's every
namespace to the client regardless of route, and its React bindings are
built for a client-driven "change language at runtime" model. next-intl's
App Router integration loads messages server-side per request and has
first-class support for the locale-as-route-segment pattern this app
already used — it's a better fit for the architecture, not a change for
its own sake.

### The locale route segment is the single source of truth

Before this phase, direction/locale state was set in **four** places:
`<html dir>` in the layout, a `LanguageProvider` `useEffect` mutating
`document.documentElement.dir`, MUI's `ThemeProvider` reading
`theme.direction`, and an ad hoc `useRTL()` hook reading it back out of
that same theme. Now there is one:

1. The `[locale]` route param is read once, server-side, in
   `src/app/[locale]/layout.tsx`.
2. `<html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>` is set
   directly from it — no client-side mutation, no `useEffect`.
3. `ThemeProvider`/`createAppTheme(locale)` (MUI's own RTL support, still
   needed until MUI is removed in a later phase) receives the same
   `locale` prop directly — it was already sourced this way, not through
   i18next, so it needed no changes.
4. Anywhere else in a client component that needs to know direction, it
   reads `useLocale()` from next-intl — never MUI theme direction, never
   `document.dir`.

`src/utils/theme/theme.ts` still contains a substantial hand-rolled RTL
shim for MUI internals (`MuiTextField`, `MuiSelect`, `MuiButton`, etc.) —
that's untouched here, it already read `locale` correctly, and it's slated
for removal only when MUI itself comes out in a later phase, not before.

### Namespace structure (unchanged)

The same 8 namespaces, same 16 JSON files, same copy as before —
[`src/i18n/request.ts`](../src/i18n/request.ts)'s `NAMESPACE_FILES` map is
the direct replacement for the old `index.ts`'s per-locale `resources`
object. `DictionaryFiles` (`src/constant/DictionaryFiles.ts`) still enumerates
them, minus three enum members (`Resources`, `Reviews`, `Videos`) that had
no backing JSON file and no call site — dead code removed, not a behavior
change (reviews/videos pages use the `Home` namespace).

Adding a namespace: add the `en`/`ar` JSON files under `src/i18n/locales/`,
add one entry to `NAMESPACE_FILES` in `request.ts`, add one entry to the
`Messages` interface in `src/types/next-intl.d.ts`, add one `DictionaryFiles`
member.

### Type safety

Replaced the old bespoke `TranslationKeyMap`/`NestedKeyOf` system (which
derived key types from the English JSON via `typeof import(...)` per
namespace, threaded through a generic on `useI18n`) with next-intl's own
documented mechanism: a global `IntlMessages` interface augmentation in
[`src/types/next-intl.d.ts`](../src/types/next-intl.d.ts), typed from the
same English JSON files. Every `useTranslations()`/`getTranslations()` call
across the app gets its `namespace` and `key` arguments checked against it
automatically — no per-call generic needed at the call site, next-intl's
own types do the narrowing as long as the namespace argument is a literal
(see `useI18n.ts` below for why that still needs a generic internally).

`src/hooks/useI18n.ts` is now a thin wrapper — kept specifically so the
~25 existing `const { t } = useI18n(DictionaryFiles.X)` call sites across
the app didn't need touching in this phase:
```ts
const useI18n = <TNamespace extends keyof IntlMessages>(namespace: TNamespace) => {
  const t = useTranslations(namespace);
  return { t };
};
```
The `<TNamespace extends ...>` generic is required, not decorative — if
`namespace` is typed as the plain union `keyof IntlMessages` instead of a
per-call-site-inferred generic, `useTranslations`'s own generic inference
can't narrow to one specific namespace's keys, and every `t()` call
silently falls back to accepting only `never` as a key. This bit us once
during the migration (`Argument of type '"joinTheCampNow"' is not
assignable to parameter of type 'never'`) — recorded here so it isn't
rediscovered the hard way.

**Dynamic-key casts**: several call sites build a translation key at
runtime (e.g. `` `packages.${pkg.category}.category` ``) and cast it,
since TypeScript can't statically verify an interpolated string against a
literal key union. The correct cast is **`as Parameters<typeof t>[0]`**,
not `as keyof typeof t`. The latter was the old pattern and happened to
work under i18next only because that `t` was a plain function with no
extra properties (so `keyof typeof t` was permissive by accident).
next-intl's `t` is a callable object with real methods attached
(`t.rich`, `t.markup`, `t.raw`, `t.has`), so `keyof typeof t` now resolves
to `"rich" | "markup" | "raw" | "has"` — the method names, not the key
type — and silently breaks every dynamic-key cast in the app.
`Parameters<typeof t>[0]` sidesteps this by extracting the type of `t`'s
actual first call parameter instead of its object keys, and is correct
regardless of what methods happen to be attached to the function.

### Missing-translation fallback policy

There was no explicit policy under i18next — this makes one, in
[`src/i18n/request.ts`](../src/i18n/request.ts):
- A missing key **never** crashes rendering, in development or production.
- In development, it's logged loudly (`console.error`) so it's caught
  before merge.
- In production, it's logged quietly (`console.warn`) and the rendered
  fallback is the dot-path key itself in brackets — e.g.
  `[missing: reviews.title]` — visibly wrong rather than silently blank,
  so a gap is a bug report, not an invisible hole. It never fabricates
  content in the other locale to fill the gap.

Verified empty in production: every page was crawled after the migration
and zero `[missing: ...]` markers appear anywhere — all existing Arabic
and English copy round-tripped correctly.

### RTL: logical properties, not manual left/right branching

The old `useRTL()` hook exposed `getPosition`/`getOppositePosition` (manual
`{left, right}` object builders) and `getProperty`/`getOppositeProperty`,
plus an `isRTL` boolean. It's deleted. What replaced it, by pattern:

- **Pure positioning** (`getPosition(x, "auto")`, `...getOppositePosition(...)`
  spread into an `sx` object): replaced with direct CSS logical properties
  — `insetInlineStart`/`insetInlineEnd`. These are mathematically identical
  to what the old functions computed (that's literally what they were
  manually replicating), so this is a zero-risk, exact substitution, not a
  design change.
- **`textAlign: isRTL ? "right" : "left"`**: replaced with
  `textAlign: "start"` everywhere it appeared — same reasoning, exact
  equivalent.
- **`direction: isRTL ? "rtl" : "ltr"`** (re-asserting a direction that's
  already ambient from `<html dir>`): deleted outright, not replaced —
  it was redundant given the single source of truth in place now.
- **Physical margin/padding pairs branching on `isRTL`** (e.g.
  `mr: isRTL ? 0 : 2, ml: isRTL ? 2 : 0`, or `pr`/`pl` pairs that swap):
  collapsed to a single unconditional logical property
  (`marginInlineEnd: 2`, `paddingInlineStart`/`paddingInlineEnd`) wherever
  the two branches were provably the same logical value — no `isRTL` left
  to read at all in those spots.
- **Genuine layout decisions** (`flexDirection: isRTL ? "row-reverse" :
  "row"`, flex `order` swaps, `transform: scaleX(-1)` icon mirroring,
  conditional rendering like the Arabic "؟" decoration in the 15-day-camp
  FAQ section, and per-locale size/spacing tweaks for glyph-width
  differences): **kept exactly as they were**, just re-sourced from a new
  `useIsRtl()` hook (`src/hooks/useIsRtl.ts`, one line: `useLocale() ===
  Locale.AR`) instead of the deleted hook's theme-direction lookup. These
  are real authorial layout/content decisions specific to components that
  either persist unchanged or are already slated for full replacement
  (the 15-day-camp directory folds into the generic Campaign system in a
  later phase) — rewriting their *logic*, not just their *data source*,
  is page-redesign work this phase deliberately doesn't do. Converting
  them to pure CSS would require verifying the resulting visual behavior
  in a browser against the current live site, which is exactly the kind of
  unverified risk this phase avoids taking on components that are about to
  be rebuilt anyway.

Net effect: 9 files touched, all genuinely dynamic/branching RTL logic
preserved 1:1, all *positional* branching eliminated in favor of logical
properties.

### Locale switching preserves route and query

`LanguageSwitch` (`src/app/components/header/LanguageSwitch.tsx`) used to
manually split and rebuild the pathname — which silently dropped any query
string on the current page. It now uses next-intl's own locale-aware
`usePathname()`/`useRouter()` (exported from
[`src/i18n/navigation.ts`](../src/i18n/navigation.ts), built via
`createNavigation(routing)`) for the locale-prefix handling, plus the plain
`useSearchParams()` (next-intl doesn't wrap this one) reattached explicitly:

```ts
const query = searchParams.toString();
router.push(query ? `${pathname}?${query}` : pathname, { locale: otherLocale });
```

Verified: `/ar` and `/en` render with the correct `lang`/`dir` pair
(`ar`/`rtl`, `en`/`ltr`); `/` redirects to `/ar` regardless of
`Accept-Language` (see "Locale detection" below); the switch logic was
traced by hand rather than clicked through a browser in this environment —
a manual click-through with a populated query string (e.g. a filtered
recipes list) is worth one pass in a real browser before this is
considered fully closed out.

### Locale detection is deliberately disabled

`routing.ts` sets `localeDetection: false`. This preserves the exact
current product behavior — `/` always resolves to Arabic, full stop, no
`Accept-Language` negotiation — rather than silently changing it as a side
effect of the library swap. Enabling browser-language negotiation is a
real product question (do English-browser visitors expect to land on
`/en`?) for a later phase to decide deliberately, not something this
infrastructure migration should decide by default.

### CMS content vs. UI copy stay separate systems

This phase's namespace files (`src/i18n/locales/**/*.json`) are **UI copy**
— button labels, headings, static page text — resolved through next-intl.
They are a different system from **CMS content** (recipes, packages,
reviews, etc.) that will be fetched from `nutrition-staff`'s API in a later
phase, where every bilingual field is a `LocalizedString = {ar, en}` object
resolved by a small `resolveLocalized(value, locale)` utility (not built
yet — scoped to the API/data-layer phase). The two are never meant to
merge into one mechanism: UI copy is versioned with the app and known at
build time; CMS content is live data fetched at request time. Don't add
CMS-shaped fields to the next-intl namespace files, and don't route static
UI copy through `resolveLocalized`.

### Static rendering: not yet, and that's intentional

Nothing in the app is statically generated today — every route is a client
component rendering fully dynamically, exactly as it was before this
phase. `generateStaticParams`/`setRequestLocale` (next-intl's recommended
pattern for statically rendering per-locale pages) were tried during this
migration and reverted: adding static params for the locale segment made
Next attempt to prerender every page under it, which immediately surfaced
"`useSearchParams()` needs a Suspense boundary" build failures in
`LanguageSwitch` (rendered on every page via the header) and would likely
surface more in other client components once actually exercised. Static
rendering is a genuine performance opportunity, but retrofitting the
Suspense boundaries it requires, correctly, across the whole component
tree is exactly the kind of work that belongs in the caching/performance
phase once real Server Components and data-fetching exist — not something
to force through as an incidental side effect of swapping the i18n engine.

## Real-browser verification conventions

Every phase since Phase 6.1 runs a real Playwright pass (375/768/1440,
`en`/`ar`) as part of its acceptance criteria. One check has produced the
same false positive on every one of those passes - worth writing down once
instead of re-diagnosing it every phase.

### Horizontal overflow: check real scroll, not `scrollWidth`

`document.documentElement.scrollWidth > document.documentElement.clientWidth`
is **not** sufficient on its own to detect a horizontal-overflow regression
in this app, and will false-positive at 375/768 on any page rendering
`DiscoverySection` (`src/sections/home/discovery-section.tsx`). That
section's recipe/video rails deliberately bleed past the container's
gutter with negative margins (`-mx-4 ... px-4`) so they read as native
edge-to-edge swipeable strips - intentional, documented in the component's
own doc comment, not a bug. `globals.css`'s `html { overflow-x: hidden }`
genuinely prevents the page from ever scrolling sideways, but the browser
can still report a wider virtual `scrollWidth` on the document element
than the viewport, independent of whether a user can actually reach it.

The correct check confirms the overflow is real and user-reachable, not
just present in `scrollWidth`:

```js
const scrollWidthFlag = await page.evaluate(
  () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
);
await page.mouse.wheel(500, 0);            // attempt a real horizontal scroll
await page.waitForTimeout(100);
const realScrollX = await page.evaluate(() => window.scrollX);
// A genuine bug is realScrollX > 1. scrollWidthFlag alone is not a
// failure - it will be true on any page rendering DiscoverySection, by
// design.
```

## Performance (Phase 7)

### Bundle analysis

`@next/bundle-analyzer` is wired into `next.config.mjs`, gated behind
`ANALYZE=true` so it costs nothing in a normal build:

```
ANALYZE=true npm run build
```

Writes `.next/analyze/{client,nodejs,edge}.html` (gitignored along with the
rest of `.next/`) — real webpack-bundle-analyzer treemaps, not a guess.
Before trusting the top-level `next build` route table's "First Load JS"
column for a layout-level change specifically: it did not reflect the
GSAP fix below at all (every route's reported total was byte-identical
before and after) even though the real, measured effect was significant.
The reliable ground truth for "does route X actually load chunk Y" is
`.next/app-build-manifest.json`'s `pages` map, cross-referenced against
which chunk actually contains the library in question (found via the
analyzer's JSON, not string-grepping minified chunk files — package names
don't reliably survive minification).

### GSAP was loading on every single page via the header

Measured, not assumed: `SiteHeader` (rendered by the root layout, so
present on every route) called `useDrawerTransition` unconditionally for
its mobile drawer, regardless of whether the drawer was ever opened. Cross-
referencing `app-build-manifest.json` confirmed `/[locale]/layout` itself
pulled in ~111kB parsed of GSAP+ScrollTrigger — meaning routes with no
GSAP-driven content of their own (`/reviews`, `/recipes/[id]`,
`/calculator`) paid that cost anyway, purely through the always-rendered
header.

Fixed by extracting the drawer panel into `mobile-nav-drawer.tsx`, loaded
via `next/dynamic(..., { ssr: false })` from `site-header.tsx`, and only
rendered into the tree from the moment a visitor first taps the hamburger
button onward (`hasOpenedDrawer` state) — not unconditionally, which would
have fetched the chunk immediately and defeated the point. Re-checking
`app-build-manifest.json` after the change confirmed `/[locale]/layout` no
longer references any GSAP chunk, and the three GSAP-free routes above no
longer load it via any path. Verified functionally afterward (not just by
bundle size): open/close/reopen, RTL-mirrored slide direction, focus trap,
focus restoration, and `prefers-reduced-motion` all still behave
identically — checked via each transform's real `translateX`, not
`isVisible()`/`boundingBox()` (see the note below on why those don't work
here).

**Found along the way, not fixed (out of scope for a performance pass):**
`SiteHeader`'s drawer panel gets `backdrop-blur` applied to its `<header>`
parent whenever the drawer is open — `backdrop-filter` on an ancestor
creates a new containing block for `position: fixed` descendants (same as
`transform` would), so the panel's `top:0; bottom:0` resolves against the
header's own ~64px box instead of the viewport. Confirmed this is
pre-existing (reproduces identically on the unmodified pre-Phase-7 code,
nothing to do with the dynamic-import change) via `getComputedStyle` — the
panel's actual GSAP-driven horizontal slide is unaffected (verified via
its transform matrix), and `overflow: visible` on the header means the
panel still paints at full height, which is almost certainly why this
was never caught by a visual check. A real bug, deliberately not fixed
here — this phase is performance-scoped, not the UI redesign/refinement
pass.

### Embla is already correctly scoped

`embla-carousel-react` (17.5kB parsed) has exactly one consumer,
`featured-reviews-carousel.tsx`, and confirmed via the analyzer that it
never appears in any other route's chunk list. No change needed — Next's
own per-route code-splitting already does the right thing here without an
explicit `next/dynamic()`.

### The site logo was serving at 47x its rendered size

Measured via a real Playwright network trace on the homepage:
`SiteSettings.logo` is a real, unmodified Cloudinary upload at its
original `1536x1024`. The header renders it at `h-10 lg:h-12`
(effectively ~50-60px tall) via `<Image width={1536} height={1024} ...>`
with no `sizes` prop — without one, `next/image` has no way to know the
image is displayed far smaller than its intrinsic dimensions, and served
a **109,378-byte** image for a logo. Adding `sizes="96px"` dropped the
real, measured transfer to **2,338 bytes** (97.9% smaller) for a resource
loaded on every single page. Re-verified with the same network-trace
method, not assumed from the code change alone.

### Lighthouse (mobile, simulated throttling), real production build

| Route | Score | LCP | CLS | TBT |
|---|---|---|---|---|
| Home | 92 | 3.2s | 0 | 0ms |
| Packages | 91 | 3.5s | 0 | 10ms |
| Recipe detail | 85 | 3.6s | 0 | 0ms |

Overall scores clear the plan's 90+ target (home/packages) with recipe
detail just under it. CLS and TBT are already excellent everywhere — LCP
is the one metric consistently over the 2.5s sub-budget. The LCP
breakdown attributes ~86% of the time to "Render Delay" rather than the
image fetch itself, and recipe detail's own `server-response-time` audit
flagged a 1.4s root-document time specifically — both consistent with
**nutrition-staff running in dev mode** (`next dev`, not a production
build) during this measurement, which is a real confound: a production
nutrition-staff deployment would not carry dev-mode's compilation/response
overhead. These numbers are honest and real for the environment they were
measured in, but likely pessimistic relative to an actual production
deployment where both apps are built for production.

Also surfaced, not acted on:
- Recipe detail's hero image has a real but modest (~15KB) responsive-image
  opportunity — `sizes` is already present and reasoned (100vw on mobile
  for a full-width hero), so this wasn't a confident, low-risk fix the way
  the logo was; recorded rather than chased for a single-digit-KB gain.
- `bf-cache` is blocked by `Cache-Control: no-store` on every dynamic
  route. This is the direct, already-documented consequence of "Static
  rendering: not yet, and that's intentional" above — not a new problem,
  and retrofitting static rendering site-wide already failed once earlier
  in this project for a documented reason (`useSearchParams()` needing
  Suspense boundaries it didn't have). Real, but a separate, deliberate,
  larger undertaking — not a Phase 7 fix.

Only `realScrollX > 1` after an attempted scroll is a real regression. If a
future page introduces a new intentionally-bleeding horizontal rail,
extend this note rather than loosening the check - the goal is "no page
the user can actually scroll sideways on", not "no element wider than the
viewport".
