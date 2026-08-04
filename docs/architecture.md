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
