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
(that's Phase 6); this is the data/API layer pages will consume.

### Layers, browser to database

```
Server Component (a future page)
  -> src/lib/data/*.ts        (one function per domain, e.g. getRecipe(id))
    -> src/lib/api/fetch-public.ts   (tagged, cached fetch)
      -> ServerApiConfig.baseURL      (STAFF_API_BASE_URL)
        -> nutrition-staff's /api/public/* (read-only GET)

Client Component (a future consultation form)
  -> src/lib/mutations/use-consultation-request.ts   (useRequesterMutation)
    -> APIConfig.baseURL = "" (same-origin)
      -> this app's own /api/consultation-requests    (Route Handler, proxy)
        -> ServerApiConfig.baseURL (STAFF_API_BASE_URL)
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
| FAQ | `getFaqSectionsWithItems()` | `GET /api/public/faq-sections`, `/faq-items` | two flat arrays, grouped client-side |
| Campaigns | `getCampaign(slug)` | `GET /api/public/campaigns/:slug` | single, time-gated |
| Consultation | `useConsultationRequest()` | `POST /api/consultation-requests` (proxy) → nutrition-staff's `/api/public/consultation-requests` | mutation |

All 8 read domains and the consultation proxy were verified against a real
running nutrition-staff instance and real MongoDB data during this phase —
see "Verification" below.

### Endpoint definitions (`api/*.endpoints.ts`)

Same convention as nutrition-staff's own frontend (`api/site-settings.
endpoints.ts` there): one file per domain under a top-level `api/`
directory (sibling to `src/`, not inside it), each exporting named
endpoint constants. No data function or route handler ever hardcodes a
path string.

**Two different endpoint types, not one** — this split exists because of a
real constraint discovered during this phase (see "The barrel-import
build bug" below), not by choice:
- The 8 read-only domains use a **local** `PublicEndpoint` type
  (`src/lib/api/public-endpoint.type.ts`) — structurally identical to
  frontend-toolkit-core's `Endpoint`, but importing that package's actual
  `Endpoint`/`MethodType` would break every page that reads CMS data.
- `createConsultationRequestEndpoint` (the one endpoint actually passed to
  `requester`/`useRequesterMutation`) uses frontend-toolkit-core's real
  `Endpoint`/`MethodType` — safe there, because it's only ever imported
  from a `"use client"` file.

Placeholder syntax is `:id`/`:slug`, not `[id]`/`[slug]` — matching
frontend-toolkit-core's actual `buildUrl` convention (bracket syntax would
silently never match anything).

### The barrel-import build bug

`@kira-joo/frontend-toolkit-core`'s single entry point calls React's
`createContext()` at module top level (for `AuthUserContext`/
`QueryParamsRouterContext`), unconditionally, the moment *any* named
export is imported — even a plain enum like `MethodType` or a pure
function like `buildUrl`. Confirmed during this phase: importing anything
real (non-`type`) from that barrel crashes Next's "Collecting page data"
build step with `TypeError: createContext is not a function`, for **both**
Route Handlers and ordinary Server Component pages — not just one or the
other, which is what made this expensive to track down (early fixes only
addressed the Route Handler case before a Server Component hit the same
wall).

`type`-only imports from the same package are completely safe (erased at
compile time, zero runtime footprint) — the problem is exclusively real
value imports. Client Components are also unaffected (they run with a
real React runtime, so `api-config.ts` and `use-consultation-request.ts`
safely import `APIConfig`/`ContentType`/`useRequesterMutation` from the
same barrel with no issue).

**What got locally reimplemented, and why each one is safe to trust**:
verified byte-for-byte against the package's own compiled `dist/index.mjs`
output, not reinvented from scratch.
- `src/lib/api/build-url.ts` — `buildUrl`/`buildQueryString`.
- `src/lib/api/normalize-api-error.ts` — `normalizeApiError` + its
  `extractMessage`/`extractError`/`extractValidationErrors` helpers.
- `src/lib/api/classify-api-error.ts` — `classifyApiError`/`isApiError`/
  `getApiErrorStatusCode`.
- `src/lib/api/public-endpoint.type.ts` — the `Endpoint`/`EndpointParams`/
  `EndpointQuery`/`EndpointReturn` type shapes (pure types, reimplemented
  only so the 8 read endpoints don't need the real `Endpoint` interface,
  which would require the real `MethodType` value alongside it).

This is a real gap worth raising upstream in `frontend-toolkit-core`
itself (splitting the barrel so React-free primitives don't force-load
`createContext`), not something to keep working around indefinitely as
the app grows — flagged here rather than fixed in that package during
this phase (modifying a shared package wasn't in scope for this work).

### Server-only base URL

`src/lib/api/server-api-config.ts` exports `ServerApiConfig`, mirroring
`APIConfig`'s "configure once, every caller reads the same object" shape —
deliberately a **separate** object from frontend-toolkit-core's actual
`APIConfig`, not the same instance repointed at nutrition-staff. `APIConfig`
is a process-wide static the client path already sets to `""` (same-origin,
in `api-config.ts`) — Next.js's server runtime is one shared Node process
across concurrent requests (and even evaluates `"use client"` modules
server-side during SSR), so if a server-side read also pointed
`APIConfig.baseURL` at nutrition-staff's origin, the two would stomp on
each other's intent in that shared process. Two small config objects, one
per execution context, is what prevents that — not a duplication to clean
up later.

`ServerApiConfig.baseURL` resolves `STAFF_API_BASE_URL` lazily (on first
read, not at module-import time) specifically so a build environment where
that env var genuinely isn't set until runtime doesn't fail `next build`
itself.

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

`fetchPublic` derives `revalidate` from `tags[0]` automatically via
`resolvePolicyRevalidate` — ordinary data functions only ever pass `tags`,
never `revalidate`, unless a call genuinely needs to deviate from policy.
Convention for multi-tag calls: the **first** tag is always the
policy/domain tag; any further tags are entity-level and participate in
invalidation only (e.g. `[CacheTag.RECIPES, CacheTag.recipe(id)]` — busts
either the whole list or just that one recipe's detail page, and the
policy lookup always uses `RECIPES`).

### Error model

One shape, `AppError` (`src/lib/api/error-model.ts`), used by every layer:
`{__isAppError, category, message, statusCode?, validationErrors?, cause}`.
`category` is one of the same categories frontend-toolkit-core's
`classifyApiError` produces (`notFound`, `validation`, `network`, etc.) —
components in a later phase branch on `category`, never on a raw status
code or a parsed response body directly.

`nullableOnNotFound(fn)` is the one place "a 404 becomes `null`, everything
else rethrows" lives — `getRecipe`/`getCampaign` both use it instead of
repeating their own try/catch. It never calls Next's `notFound()` itself;
a data function isn't the right layer to make a navigation decision — the
calling page decides what `null` means (a 404, an empty state, something
else).

**A real classification bug, caught during verification**: `isApiError`'s
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

`resolveLocalized(value, locale)` / `isLocalizedFallback(value, locale)`
(`src/lib/i18n/resolve-localized.ts`) resolve a CMS `LocalizedString`
`{ar, en}` to a plain string — the display-side counterpart toolkit-common
never shipped (it only has write-side helpers). Deliberately **not** in a
`"use client"` file: a Server Component importing a plain function from a
`"use client"` module gets a client reference it can't call directly
(confirmed during this phase — `resolveLocalized` briefly lived in a
`"use client"` file and threw `"resolveLocalized is not a function"` from
every Server Component that tried to call it). `useResolveLocalized()`
(`src/lib/i18n/use-resolve-localized.ts`) is the separate, genuinely
`"use client"` sugar for Client Components that don't want to re-pass
`locale` on every call — it wraps the same two functions, it doesn't
duplicate their logic.

This stays a fundamentally different system from next-intl's UI-copy
translation (`useI18n`/`useTranslations`): CMS content is live data fetched
per-request; UI copy is versioned with the app and known at build time.
Neither should route through the other's mechanism.

### Verification

Real, not simulated: a local nutrition-staff instance was run against its
actual MongoDB data for this phase's verification (a temporary Server
Component page exercised every data function directly, since no real page
consumes this layer yet — Phase 6 builds that). Confirmed:
- Every one of the 8 read domains returns real data, in both `ar` and
  `en`, including a genuine partial-translation case (`site-settings`'s
  `defaultSeo.description.en` is empty in the live database) correctly
  falling back to the populated locale rather than rendering blank.
- `getRecipe`/`getCampaign` both return `null` (not a thrown error, not a
  crash) for a real 404/expired-or-nonexistent slug.
- A genuine validation error (`GET .../recipes/not-a-valid-id`) classifies
  correctly as `"validation"` with the real `{field, message}` array from
  nutrition-staff's response — the fix described above was verified
  against this exact live response, not a mocked one.
- FAQ items group and sort correctly by the CMS-authored `order` field
  against real backend data that is *not* already in that order (`/api/
  public/faq-sections` returns "Section 2" before "Section 1") — proving
  the sort is load-bearing, not defensive.
- The consultation-requests proxy was posted to directly and confirmed to
  round-trip through to nutrition-staff and back with a real `{success:
  true}` response.
- This also caught and fixed a real Phase 3 regression unrelated to this
  phase's own code: the `faq` UI-copy namespace (`src/i18n/locales/*/
  faq.json`) stored flat keys with literal dots (`"section1.q1.question"`)
  instead of nested objects, which next-intl rejects outright
  (`INVALID_KEY`) — the actual `/ar/faq`/`/en/faq` pages were broken since
  Phase 3 and nobody had hit them with next-intl's real namespace
  validation until this phase's testing did. Restructured both locale
  files into proper nested JSON; the page code's `t("section1.q1.
  question")` calls needed no changes, since next-intl's dot-path lookup
  against a real nested object is exactly what that call syntax expects.

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
