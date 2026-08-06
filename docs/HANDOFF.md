# Engineering Handoff — Dr. Omnia Nutrition Platform

**Purpose of this document:** a complete, self-contained handoff. A new engineer (or a fresh AI session with zero prior context) should be able to read this document, orient themselves, and continue the work without needing anything from the conversation history that produced it. Where this document and the code disagree, **trust the code** — this is a snapshot, not a live source of truth.

**Written:** 2026-08-06, at the end of Phase 5 (on-demand cache invalidation) plus a follow-up architecture refactor (declarative `revalidateTags`). Phase 6 (page building) has **not started**.

---

## 1. Project overview

### What this is

A full ground-up rebuild of the public website for Dr. Omnia's nutrition clinic (`nutrition-client`), backed by an existing CMS/CRM admin system (`nutrition-staff`), sharing a family of internal npm packages (the "toolkit ecosystem"). The rebuild replaces a legacy MUI/Emotion/i18next static site with a Tailwind + next-intl + GSAP site that reads real CMS content from nutrition-staff instead of hardcoded constants, and captures real leads into nutrition-staff's CRM instead of only opening a WhatsApp link.

### Repositories involved

| Repo | Role | Path |
|---|---|---|
| `nutrition-client` | Public Next.js 14 site (the product being rebuilt) | `/Users/joe/Desktop/code/personal/nutrition-client` |
| `nutrition-staff` | Next.js 14 CMS/CRM admin app — the single backend | `/Users/joe/Desktop/code/personal/nutrition-staff` |
| `frontend-toolkit-core` | Shared frontend primitives (API client, routing, React Query, auth helpers) | `/Users/joe/Desktop/code/personal/frontend-toolkit-core` |
| `frontend-toolkit-tailwind` | Shared Tailwind UI components (AssetViewer, Timeline, etc.) | `/Users/joe/Desktop/code/personal/frontend-toolkit-tailwind` |
| `toolkit-common` | Zero-dependency shared vocabulary (types, enums, pure helpers) used by both frontend and backend toolkits | `/Users/joe/Desktop/code/personal/toolkit-common` |
| `backend-toolkit-core` | ODM-agnostic backend primitives (DTOs, errors, auth types) | `/Users/joe/Desktop/code/personal/backend-toolkit-core` |
| `backend-toolkit-mongoose` | Mongoose-specific repository/schema layer | `/Users/joe/Desktop/code/personal/backend-toolkit-mongoose` |
| `backend-toolkit-next` | Next.js Route Handler factories (auth pipeline, validation, **now: declarative cache revalidation**) | `/Users/joe/Desktop/code/personal/backend-toolkit-next` |
| `backend-toolkit-cloudinary` | Cloudinary asset-upload integration | `/Users/joe/Desktop/code/personal/backend-toolkit-cloudinary` |

All packages publish to GitHub Packages under the `@kira-joo` npm scope (`registry=https://npm.pkg.github.com`).

### Current package versions

| Package | Published version | Consumed by nutrition-client at | Consumed by nutrition-staff at |
|---|---|---|---|
| `@kira-joo/frontend-toolkit-core` | **0.5.0** | `^0.5.0` ✅ | `^0.4.2` ⚠️ stale |
| `@kira-joo/toolkit-common` | **0.3.0** | `^0.3.0` ✅ | `^0.2.0` ⚠️ stale |
| `@kira-joo/backend-toolkit-next` | **0.4.0** | n/a | `^0.3.1` on `main`, `^0.4.0` on the **unmerged** `feature/on-demand-cache-invalidation` branch |
| `@kira-joo/frontend-toolkit-tailwind` | 0.4.2 | `^0.4.2` | `^0.4.2` |
| `@kira-joo/backend-toolkit-core` | 0.3.4 | — | `^0.3.4` |
| `@kira-joo/backend-toolkit-mongoose` | 0.3.2 | — | `^0.3.2` |
| `@kira-joo/backend-toolkit-cloudinary` | 0.1.1 | — | `^0.1.1` |

**⚠️ nutrition-staff has not been bumped onto the new `frontend-toolkit-core`/`toolkit-common` versions.** It only consumes `frontend-toolkit-core` for the type-only `LocalizedString` re-export today, so this is low-risk, but it's real drift — see §10.

### Branch strategy

- **Toolkit packages** (`frontend-toolkit-core`, `toolkit-common`, `backend-toolkit-next`, and the other backend-toolkit-\* packages): commit and push directly to their default branch (`main`, except `frontend-toolkit-core` which is still on `master` — see §12, this was deliberately **not** renamed per explicit user instruction: "Branch naming consistency is not important enough to justify changing an already-working repository").
- **nutrition-client**: work happens on branch `new-1`. No explicit instruction yet about merging `new-1` into `main`/`master` — treat it as the active working branch until told otherwise.
- **nutrition-staff**: as of this handoff, a **standing rule**: *never push nutrition-staff work directly to `main`*. Every phase/feature's nutrition-staff changes go on its own `feature/<name>` branch, get fully verified there, and are pushed. The user explicitly merges (or asks Claude to merge) feature branches into `main` themselves, phase by phase, after reviewing. Two branches were previously merged and deleted (`feature/public-faq-composed-endpoint`, `feature/on-demand-cache-invalidation` — the *first* incarnation, before the `revalidateTags` refactor). A **new** `feature/on-demand-cache-invalidation` branch exists right now with the `revalidateTags` migration, **not yet merged** — see §12 for exact commit hashes.

### Current phase

**Between Phase 5 and Phase 6.** Phase 5 (on-demand cache invalidation) was approved, then immediately followed by an architectural refactor (moving revalidation out of route handlers and into a declarative `revalidateTags` route-factory option). That refactor is now complete, tested, and committed to a feature branch — but **not yet merged to main**, and **Phase 6 has explicitly not started** per direct instruction. This handoff document is the deliverable that replaces starting Phase 6.

### Roadmap overview

The full original plan lives at `/Users/joe/.claude/plans/nutrition-client-purring-toucan.md` (referenced throughout this project as "the master plan"). Section numbers below (`§X`) refer to that plan file, not this document. Phases:

1. Foundation (toolkit adoption, dependency cleanup, GSAP) — **done**
2. Theme and design-token foundation — **done**
3. RTL/localization infrastructure (next-intl) — **done**
4. API and data layer — **done**, then substantially refactored for package-first architecture
5. Caching layer + on-demand invalidation — **done**, then refactored into a declarative route-factory API
6. Per-content-type integration (real pages: homepage, doctor, packages, FAQ, recipes, reviews/videos, campaigns, consultation) — **not started**
7. SEO/perf polish — not started
8. Empty/error/loading states pass — not started
9. Accessibility verification pass — not started
10. Cleanup (delete legacy MUI/mongodb/framer-motion remnants) — partially done in Phase 1, final sweep not done

---

## 2. Current implementation status

### Completed

- **Phase 1 (Foundation)** — toolkit packages adopted, MUI/Emotion/i18next/framer-motion/mongodb removed, GSAP added, ESLint configured project-wide, Embla kept as the sole carousel.
- **Phase 2 (Theme/design tokens)** — full token system (color, type, spacing, containers, radii, shadows, borders, gradients, motion, z-index, focus rings, overlays, icon sizes, control heights, touch targets) in `docs/design-system.md`/`docs/theme.md`. Measured WCAG contrast (not assumed). Dual-layer focus rings for filled controls.
- **Phase 3 (RTL/localization)** — next-intl replacing i18next. Single `dir` source via the locale route segment. Logical CSS properties instead of manual RTL branching.
- **Phase 4 (API/data layer)** — built, then **substantially reworked twice**:
  1. First pass: a full public data layer against all 9 nutrition-staff domains, with local workarounds for a real packaging bug in `frontend-toolkit-core` (see §6).
  2. Second pass ("package-first refactor"): the packaging bug was fixed at the source (`frontend-toolkit-core@0.5.0`'s new `/server` entry point), every local workaround was deleted, generic pieces were promoted into the toolkits, API routes were centralized, and the FAQ domain was moved from two client-merged endpoints to one backend-composed endpoint.
- **Phase 5 (Caching/on-demand invalidation)** — built, verified end-to-end with real cache-hit/miss proof, then **refactored**: moved from imperative `await revalidateX()` calls inside 38 route handlers to a declarative `revalidateTags` option on the route factory itself (`backend-toolkit-next@0.4.0`).

### Current checkpoint

The revalidateTags refactor is code-complete, typechecked, built, and tested (backend-toolkit-next: 39 new unit tests + 182 total passing). It is committed to `nutrition-staff`'s `feature/on-demand-cache-invalidation` branch and to `backend-toolkit-next`'s `main` branch (published as 0.4.0). **It has not been merged into nutrition-staff's `main`** — that merge is the user's call.

### Next phase

**Phase 6: per-content-type integration** — building the actual public pages (homepage, doctor profile, packages, recipes, reviews, videos, FAQ, campaigns, consultation form) that consume the data layer built in Phases 4–5. Nothing in `nutrition-client`'s `src/app/[locale]/**` currently renders real CMS data — every page is still the pre-rebuild static/MUI page or a stub. See §4 for the recommended order.

### Unfinished work (blocking or advisory)

- **A real credential/environment problem**: partway through publishing `backend-toolkit-next@0.4.0`, the GitHub Packages registry started returning `401 Unauthorized` for *every* package read (confirmed via `npm whoami` also failing with 403). The publish itself had already succeeded (confirmed by inspecting the published tarball's contents). This means:
  - `nutrition-staff`'s `package-lock.json` could **not** be regenerated against the real registry version of `backend-toolkit-next@0.4.0` — verification for that dependency was done via a local tarball built from the exact commit that was published, not a real `npm install` from the registry.
  - **First thing the next engineer should do**: check/refresh the GitHub Packages auth token (`~/.npmrc`'s `//npm.pkg.github.com/:_authToken`), then run a clean `npm install` in `nutrition-staff` on the `feature/on-demand-cache-invalidation` branch to regenerate `package-lock.json` for real, and re-verify build/typecheck once more before merging to `main`.
- nutrition-staff's `frontend-toolkit-core`/`toolkit-common` dependency versions are stale (see §1's table) — low risk today, but should be bumped before anything in nutrition-staff starts depending on the newer exports (e.g. `resolveLocalized`).
- No real Phase 6 work has started. Every page-building task in the master plan's §§4–14 is still open.

---

## 3. Detailed phase-by-phase summary

### Phase 1 — Foundation

**What was implemented:** Added `@kira-joo/frontend-toolkit-core`, `@kira-joo/frontend-toolkit-tailwind`, `@kira-joo/toolkit-common` as dependencies. Removed `@mui/material`, `@mui/icons-material`, `@emotion/react`, `@emotion/styled`, `i18next`/`react-i18next`, `framer-motion`, `mongodb`. Added GSAP. Renamed `package.json`'s name from the leftover `"sendemail"` to `"nutrition-client"`. Set up ESLint using the same conventions as the rest of the `@kira-joo` ecosystem, *before* Phase 2 started (explicit requirement: lint had to be available throughout implementation, not bolted on at the end). Kept Embla as the sole carousel dependency.

**Why:** the existing codebase was a fully static MUI app with zero live backend integration — a genuine rewrite, not a migration (see the master plan's "Rewrite policy" section, which governs the whole project: existing code is business-logic/content source material only, never a UI or architecture constraint).

**Verification:** typecheck/build/lint clean; confirmed zero remaining imports of the removed packages via grep sweep.

### Phase 2 — Theme and design-token foundation

**What was implemented:** A complete CSS-custom-property + `tailwind.config.ts` token system, documented in `docs/design-system.md` and `docs/theme.md`. Categories: semantic colors, typography scale (Arabic line-height tuned independently from Latin), spacing, container widths, breakpoints, radii, shadows, borders, gradients, animation durations/easings, z-index layers, focus rings, overlay/scrim tokens, icon sizing, control heights, touch target sizing.

**Architectural decisions and why:**
- **Dual-layer focus rings** for filled controls (inner white ring + outer focus-colored ring) — chosen specifically for forced-colors-mode compatibility, and to stay visible on filled/light/dark/image-backed surfaces without breaking border radius. Only fires on `:focus-visible`.
- **Contrast claims are measured, not assumed** — the user explicitly rejected an earlier draft that stated WCAG pass/fail without computing actual relative-luminance ratios. Every documented pairing was re-verified with real contrast math.
- **One motion-token source, not two** — an earlier draft had motion durations/easings defined in two places (CSS custom properties and a JS constants file) that could drift; consolidated to one source of truth with the other generated from it (see `scripts/generate-motion-css.mjs`, which the build pipeline runs via `prebuild`/`predev`).
- **`darkMode: "class"` enabled structurally, but dark mode itself is not shipped** — no existing usage anywhere in the ecosystem; shipping it half-finished would violate the project's explicit "no half-finished implementations" standard.

**Verification:** the *implementation* was validated against a checklist, not just the docs — confirmed the actual CSS variables/Tailwind config match what the docs claim, not only that the docs read correctly.

### Phase 3 — RTL and localization infrastructure

**What was implemented:** Migrated from i18next/react-i18next to `next-intl` v3.26.3. `src/i18n/routing.ts` is the one place supported locales (`ar`, `en`) and the default locale (`ar`) are declared. `src/middleware.ts` uses next-intl's `createMiddleware`. Every route lives under `src/app/[locale]/**`; the locale segment's layout sets `<html dir>` server-side once. Deleted the old `useRTL()` hook in favor of Tailwind logical properties (`ms-*`/`me-*`/`text-start`/`start-*`).

**Why:** the previous app had *four* uncoordinated RTL mechanisms (html `dir`, a `LanguageProvider`'s `document.dir` mutation, MUI theme `direction`, and the ad hoc `useRTL()` hook per page) — consolidating to next-intl's routing + CSS logical properties collapses that to one mechanism.

**Verification:** confirmed `/ar/*` and `/en/*` routes both resolve, `lang`/`dir` attributes render correctly, locale switching works, via real browser/curl checks (not just code reading).

**Important note found later:** a **dormant bug from this phase** wasn't caught until Phase 4 — `src/i18n/locales/{ar,en}/faq.json` stored flat keys with literal dots (`"section1.q1.question"`) instead of nested objects. next-intl rejects that outright with `INVALID_KEY`, so `/ar/faq` and `/en/faq` had been broken since Phase 3 and nobody had hit them with next-intl's real namespace validation until Phase 4's testing did. Fixed by restructuring both files into proper nested JSON.

### Phase 4 — API and Data Layer (two passes)

#### Pass 1 (original implementation)

**What was implemented:** A complete server-side public data layer covering all 9 CMS domains (site settings, doctor profile, packages, recipes, reviews, videos, FAQ, campaigns, consultation). Server-first caching via Next's `fetch(url, {next:{revalidate,tags}})`. One consistent `AppError` model. A BFF proxy pattern (`nutrition-client`'s own `/api/consultation-requests` route, never the browser calling nutrition-staff directly — nutrition-staff has no CORS support).

**A real, serious bug found and worked around:** `@kira-joo/frontend-toolkit-core`'s single barrel entry point called `React.createContext()` at module top level unconditionally (for `AuthUserContext`/`QueryParamsRouterContext`). Server Components and Route Handlers resolve `react` through Next's `"react-server"` condition, which has no `createContext` — so importing **anything** from that barrel, even a plain enum like `MethodType`, crashed Next's "Collecting page data" build step. Confirmed for both Route Handlers *and* ordinary Server Component pages (the two-sided nature of the bug is what made it expensive to track down — early fixes only addressed the Route Handler case before a Server Component hit the same wall).

**The workaround (temporary, later removed in Pass 2):** four local reimplementations verified byte-for-byte against the package's own compiled output — `build-url.ts`, `normalize-api-error.ts`, `classify-api-error.ts`, `public-endpoint.type.ts` — plus a local `error-model.ts` (an `AppError` shape) and a local `resolve-localized.ts` (display-side CMS-content locale resolution, since no such helper existed anywhere in the toolkit ecosystem).

**Backend work (nutrition-staff):** a new `POST /api/public/consultation-requests` endpoint (real CRM lead creation — `Client`/`ClientProfile`, `ClientSource.WEBSITE`, `ClientLifecycle.LEAD`), a simple in-memory sliding-window rate limiter, honeypot + minimum-time-to-submit anti-spam. Also fixed a real, unrelated backend bug: `Reflect.getMetadata is not a function` on several public GET routes, caused by a missing global `reflect-metadata` polyfill import — fixed in `src/instrumentation.ts`.

**Explicit corrections applied mid-phase** (user-driven, not self-initiated):
- "Do not hardcode API paths as string literals" → led to the `api/<domain>.endpoints.ts` convention (mirroring nutrition-staff's own frontend).
- "Do not hardcode default sorting in the public client" → removed a client-side `.sort()` from `getPackages()` (kept one justified exception in FAQ item grouping, since real backend data proved the raw order didn't match intended display order).
- A cache-tag/cache-policy separation request, **explicitly rejecting** moving the tag taxonomy into `toolkit-common` ("these tags are project-specific business contracts... the toolkit packages must not contain nutrition-specific tags, enums, routes, or domain knowledge") — cache tags stay a hand-kept-in-sync duplicate between the two apps, never a shared package.
- "This API configuration is incomplete" → led to `ServerApiConfig`, a **deliberately separate** object from `frontend-toolkit-core`'s `APIConfig` (not the same instance repointed) — see §6/§7 for why merging them would be a real bug, not a simplification.

#### Pass 2 (package-first refactor)

Triggered by an explicit new instruction set: *"Packages are the default, not the fallback... audit the packages first... promote genuinely reusable code into the packages... remove temporary duplicated helpers."*

**What changed:**
- **Root-caused and fixed the barrel bug** at the source: `frontend-toolkit-core@0.5.0` ships a genuinely separate `/server` build entry (`tsup` multi-entry output) containing only React-free modules — never bundled alongside the context/provider code, so importing it can never pull that code in even transitively. Verified by grepping the compiled `dist/server.mjs` for zero `createContext` references.
- **Promoted five genuinely generic pieces into the toolkits, all consumed back from the published packages:**
  - `resolveLocalized`/`isLocalizedFallback` → `toolkit-common` (pure `LocalizedString` display logic, zero framework dependency).
  - `AppError`/`isAppError`/`toAppError`/`isNotFoundError`/`nullableOnNotFound` → `frontend-toolkit-core` (built on that package's own `classifyApiError`/`normalizeApiError`/`isApiError`).
  - `joinUrl` → `frontend-toolkit-core` (extracted from `requester`'s own internal private helper into a named export; `requester` now imports the same function instead of a private copy).
  - `createCachePolicyResolver` → `frontend-toolkit-core` (the generic tag→revalidate-seconds lookup *mechanism*; concrete tags/intervals stay local).
  - `createLazyEnvBaseUrlConfig` → `frontend-toolkit-core` (the lazy-env-var-config *pattern*; defaults to reading `API_URL` with zero arguments — the common one-upstream-backend case).
- **Deleted all four Pass-1 local workaround files** plus the local `error-model.ts`/`resolve-localized.ts` — every call site now imports the real published functions.
- **Centralized every route string** into `api/public-api-route.ts` — no `"/api/..."` literal anywhere else in the codebase.
- **Fixed a real base-URL bug**: switched from `new URL(path, base)` to `joinUrl(base, path)` everywhere. `new URL()`'s resolution algorithm treats a leading-`/` `path` as *replacing* the base's entire path (keeping only its origin) — `new URL("/public/x", "https://host/api")` resolves to `"https://host/public/x"`, silently dropping `/api`. This was caught specifically because the env var was renamed from `STAFF_API_BASE_URL` (origin-only, e.g. `http://localhost:3333`, which never exposed the bug since there was no path segment to lose) to `API_URL` (which now *owns* the `/api` prefix, e.g. `http://localhost:3333/api`) to match `createLazyEnvBaseUrlConfig()`'s new zero-argument default.
- **FAQ moved from two client-merged endpoints to one backend-composed endpoint.** `GET /api/public/faq` (nutrition-staff) now joins sections with their items, applies the staff-authored `order` field, and filters to published-only, server-side — replacing `/api/public/faq-sections` + `/api/public/faq-items` + a client-side `groupFaqItemsBySection` merge. Rationale (explicit from the user): "grouping/sorting/filtering published content is backend business logic, not frontend presentation logic."

**Verification:** every change in this pass was verified against a real running nutrition-staff instance and real MongoDB data (not code inspection) — including a before/after proof that FAQ sections previously came back in the wrong order (`["Section 2", "Section 1"]`) and now come back correctly ordered from the new composed endpoint.

### Phase 5 — On-demand cache invalidation (two passes)

#### Pass 1 (original implementation)

**What was implemented:** `nutrition-client`'s `POST /api/revalidate` — authenticates via constant-time comparison (`crypto.timingSafeEqual`) against `Bearer <REVALIDATE_SECRET>`, then calls Next's `revalidateTag()` for each tag in the request body. `nutrition-staff`'s `publishRevalidation(tags)` — POSTs to that endpoint, awaited (not fire-and-forget — genuine detached fire-and-forget is unsafe on serverless), bounded by a hard 2.5s `AbortController` timeout. Wired into all 38 mutating routes across 12 public-facing entities via **imperative** calls (`await revalidateRecipes(id)`, etc.) placed directly inside each route's handler body.

**Verification (real, not simulated):** with both apps actually running — a tagged fetch was a genuine cache miss on first request (logged in nutrition-staff's dev server) and a genuine cache hit on immediate repeat (zero requests reaching nutrition-staff); calling `/api/revalidate` for that tag made the *next* request a fresh cache miss again, proving `revalidateTag()` actually evicted the entry. Resilience proven directly: with nutrition-client killed, `publishRevalidation` resolved in ~0.1s without throwing (immediate `ECONNREFUSED`, nowhere near the 2.5s timeout).

**A real gap disclosed honestly:** no real nutrition-staff admin credentials exist in this environment (the live database has production-shaped data, not seeded test accounts), so an actual authenticated `PUT`/`POST`/`DELETE` through nutrition-staff's real HTTP routes was never independently curled to prove the exact wired call site fires at request time. Both halves of the pipeline (the receiving endpoint, and `publishRevalidation` itself) were verified directly instead.

#### Pass 2 (declarative `revalidateTags` refactor)

Triggered by an explicit instruction: move the repeated `const result = await mutate(...); await revalidateEntity(...); return result;` pattern out of route handlers and into the shared route-factory layer, as a **declarative** option — with dynamic, typed tag resolution, and correct handling of the campaign slug-change case (which needs to invalidate the *previous* slug's cached page, not just the new one).

**What changed — see §6/§9 for the full design, and §10 for why the toolkit (not app-local code) was the right place for this:**

- `@kira-joo/backend-toolkit-next`'s `createRoute` gained a `revalidateTags` option: a static `string[]`, or a function `(context) => string[] | Promise<string[]>` where `context` is `{result, params, body, query, request, user}` (the handler's own return value plus everything the handler itself received). Resolved once, strictly after the handler succeeds (never on a thrown error), deduplicated, empty strings dropped, published via a new optional `config.cache.publishRevalidation` hook.
- Added `withRevalidationMeta(response, meta)` for the one genuinely exceptional case: a campaign header update can change `slug`, and the tag resolver needs the *previous* slug to invalidate the old cached page — data the public `Campaign` response itself must not carry. `createRoute` unwraps this transparently: the HTTP response becomes `response`; the resolver's `result` context becomes the whole `{response, meta}` object.
- `nutrition-staff`'s `publishRevalidation` was **inverted**: it now *throws* (distinguishable messages for timeout/non-2xx/network failure, never including `REVALIDATE_SECRET`) instead of swallowing everything itself. The toolkit's `createRoute` is what now catches and logs (`console.warn`) any rejection, and guarantees a cache-invalidation failure never turns a successful write into a failed response.
- `revalidate-entity.ts` was rewritten from a set of async `revalidateX()` functions (each calling `publishRevalidation` itself) into a set of plain tag arrays/pure resolver functions (`RECIPES_TAGS`, `recipeDetailTags(id)`, `campaignSlugChangeTags(previousSlug, newSlug)`, etc.) — consumed directly as a route's `revalidateTags` value, with zero function calls inside any handler body.
- All 38 mutating routes across 12 entities were migrated. Every route's handler reverted to its pre-Phase-5 shape (a bare repository call, no manual restructuring to thread a revalidate call through).

**Why the toolkit, not an app-local wrapper:** the requested API shape (`revalidateTags?: string[] | ((args) => string[] | Promise<string[]>)`, with `args` needing `{result, params, body, query, request}`) maps directly onto `backend-toolkit-next`'s existing `CreateRouteOptions`/`RouteHandlerContext` generic typing system — "preserve full inference" is only meaningfully achievable by extending that system at its source, not by wrapping it externally. The toolkit stays completely opaque to what a "tag" means or where invalidation requests go (`config.cache.publishRevalidation` is an app-supplied function); only the generic mechanism (resolve → dedupe → publish → log-on-failure) lives in the toolkit. The concrete `CacheTag` values and the HTTP-calling `publishRevalidation` implementation stay 100% local to nutrition-staff, per the explicit standing rule that toolkit packages carry zero nutrition-domain knowledge.

**Tests added** (`backend-toolkit-next/src/routes/create-route.test.ts`, new `describe("createRoute — revalidateTags")` block, 12 tests): static tags publish once after success; a dynamic resolver receives typed `params`/`body`/`query`/`request`/`result`; duplicate tags are deduplicated; empty resolved lists publish nothing; a thrown handler error skips revalidation entirely; a rejecting `publishRevalidation` doesn't change the successful response and logs a warning; no-configured-hook is a silent no-op; `withRevalidationMeta` correctly unwraps the response while exposing `{response, meta}` to the resolver, for both a changed-slug and an unchanged-slug case.

**Verification:** `backend-toolkit-next` — 39/39 new-suite tests pass, 182/182 total, typecheck clean, build clean. `nutrition-staff` — typecheck clean, production build clean (all 38 migrated routes compile and resolve `revalidateTags` types correctly with zero manual casts). `publishRevalidation`'s new throw-based behavior was re-verified directly: resolves cleanly on success, throws a real distinguishable message (no secret) when nutrition-client is unreachable. **Not independently re-verified**: an actual authenticated mutation through nutrition-staff's real HTTP routes (same credential gap as Phase 5 Pass 1).

**A real environment blocker hit near the end:** immediately after `npm publish`ing `backend-toolkit-next@0.4.0` succeeded, the GitHub Packages registry started returning `401 Unauthorized` for every package read (not just this one — confirmed via `npm whoami` also failing). This blocked regenerating `nutrition-staff`'s `package-lock.json` against the real published version; verification instead used a local tarball built from the exact published commit. See §2/§10 for the follow-up action needed.

---

## 4. Remaining roadmap

### Phase 6 — Per-content-type integration (next)

**Objective:** build the actual public pages that render real CMS content through the data layer already built in Phases 4–5.

**Recommended implementation order** (per the master plan's dependency ordering): global layout (site settings: header/footer/contact/social) → doctor profile → packages → FAQ → recipes (introduces the filter/pagination pattern) → reviews/videos (introduces the video player + carousel) → campaign block renderer → consultation form wired to the real backend endpoint.

**Expected architecture:** Server Components fetch via the existing `src/lib/data/*.ts` functions (already built, already tagged/cached — nothing new needed there). Presentation split per the master plan's `src/components/ui` (server-renderable, token-driven primitives) vs `src/components/interactive` (`"use client"` leaf components only where truly needed — forms, carousel, video controls, lightbox, drawer) vs `src/sections` (page-level composition, accepts already-fetched data as props, never fetches itself). GSAP hooks (`useGsapReveal`, `useScrollTriggerTimeline`) need to be built — nothing like this exists yet anywhere in the toolkit ecosystem, and per the master plan these stay app-local for now (not obviously reusable across unrelated projects yet).

**Dependencies:** none blocking — the entire data layer is ready. The one real gap: recipes' missing `foodGroups` filter query param on the backend (client-side post-filter is the documented, accepted workaround per `docs/architecture.md`).

**Risks:**
- The master plan has a hard design-quality gate: sections must not read as a generic AI-landing-page template (no repeated "hero → three cards → heading → three cards" pattern). This needs active design judgment per section, not just implementation speed.
- Mobile is designed first, but tablet/desktop must independently pass the same quality bar — not a "collapse in reverse" of the mobile layout. See master plan §6 for the explicit list of disallowed desktop failure modes.
- GSAP + ScrollTrigker licensing should be reconfirmed at implementation time (the master plan flags this as a known unknown from its own knowledge cutoff).

**Acceptance criteria** (per the master plan's phase-completion standard, §27/§28): mobile, tablet, and desktop independently verified; the design-quality repetition check applied section-by-section; no new hardcoded token-system values introduced; verified across the full matrix in master-plan §28 (viewports, locale/RTL, keyboard+touch, `prefers-reduced-motion`, slow network, empty/long/partial-translation/missing-media data conditions, real backend data).

### Phase 7 — SEO/perf polish

`generateMetadata` per route pulling from `site-settings.defaultSeo` with per-entity overrides, dynamic OG images where valuable, canonical URLs + locale alternates, `sitemap.ts`/`robots.ts`, JSON-LD strictly limited to what the data supports (explicitly **no** `Review`/`AggregateRating` — no numeric rating field exists in the CMS). Dynamic-import audit for GSAP/carousel/video-player (never globally bundled). Bundle analysis against the master plan's performance budgets (Lighthouse mobile 90+, LCP <2.5s, CLS <0.05, INP <200ms) — these numbers are targets to measure against, not yet-measured facts.

**Dependency:** Phase 6 must exist first (nothing to measure/optimize yet).

### Phase 8 — Empty/error/loading states pass

Per-module empty states (recipes/reviews/videos/FAQ/packages/campaigns/doctor-gallery — each with its own copy/illustration, not one generic component reskinned), a real `not-found.tsx` + route-level `error.tsx` boundaries, content-shaped loading skeletons matching real content dimensions (a CLS requirement, not just polish).

**Dependency:** Phase 6.

### Phase 9 — Accessibility verification pass

Built in during Phase 6 component-by-component per the master plan, but a dedicated final pass against the full WCAG 2.2 AA checklist (keyboard nav, focus trapping + restoration, RTL icon-mirroring rules, `prefers-reduced-motion`, screen-reader labels) is still owed as its own explicit step.

**Dependency:** Phase 6.

### Phase 10 — Cleanup sweep

Final `grep` sweep confirming zero remaining MUI/mongodb/framer-motion references anywhere in `nutrition-client`. Most of this was already done in Phase 1; this is the final confirmation pass, not new removal work.

---

## 5. Repository map

### `nutrition-client`

**Purpose:** the public website being rebuilt.

**Important folders:**
- `src/app/[locale]/**` — every route, locale-scoped. **Currently still pre-rebuild/stub pages** — Phase 6 replaces these.
- `src/app/api/` — this app's own Route Handlers: `consultation-requests/route.ts` (BFF proxy to nutrition-staff), `revalidate/route.ts` (on-demand cache invalidation receiver).
- `src/lib/data/` — one function per CMS domain (`getSiteSettings`, `getRecipes`, `getFaqSectionsWithItems`, etc.) — **read this first**, it's the entire public-facing data contract.
- `src/lib/api/` — `fetch-public.ts` (the one place every server-side CMS read goes through), `server-api-config.ts`, `api-config.ts`.
- `src/lib/cache/` — `cache-tags.ts` (the tag taxonomy), `cache-policy.ts` (fallback revalidate intervals).
- `src/lib/domain/` — hand-written types mirroring nutrition-staff's actual response shapes.
- `src/lib/mutations/` — the one client-side mutation (`use-consultation-request.ts`).
- `src/lib/i18n/` — `use-resolve-localized.ts` (the `"use client"` wrapper over `toolkit-common`'s pure `resolveLocalized`).
- `api/` (top-level, sibling to `src/`) — `public-api-route.ts` (every route string, centralized) + one `<domain>.endpoints.ts` file per domain.
- `docs/` — `architecture.md` (the living technical doc — **read this before touching any data-layer code**), `design-system.md`, `theme.md`, this file.

**Read first:** `docs/architecture.md`, then `src/lib/data/`, then `api/public-api-route.ts`.

### `nutrition-staff`

**Purpose:** the CMS/CRM admin app — the single backend for everything.

**Important folders:**
- `src/app/api/public/**` — every public, unauthenticated endpoint nutrition-client reads from.
- `src/app/api/<entity>/**` — the authenticated admin CRUD routes for each entity (the ones with `revalidateTags` wired in — see §8).
- `src/server/<entity>/` — schema, repository, DTOs per entity.
- `src/server/core/revalidation/` — `cache-tag.ts` (mirrors nutrition-client's tags), `publish-revalidation.ts` (the HTTP call to nutrition-client), `revalidate-entity.ts` (the tag tables/resolvers every route consumes).
- `src/server/core/route-factories.ts` — thin re-export of `@kira-joo/backend-toolkit-next`'s factories; every route imports from here.
- `src/server/core/toolkit.config.ts` — the one `configureNextBackendToolkit()` call, including `cache.publishRevalidation` registration.
- `src/server/faq/get-public-faq.ts` — the composed public FAQ join.

**Read first:** `src/server/core/toolkit.config.ts` (see how everything is wired globally), then `src/server/core/revalidation/`, then any one entity's route files (e.g. `src/app/api/recipes/`) as a template for the rest.

### `frontend-toolkit-core`

**Purpose:** shared frontend primitives — API client (`requester`), routing (`buildAppHref`), React Query wiring, auth context, storage, CRUD generator.

**Important files:**
- `src/index.ts` — the root barrel (client-safe, includes React context/provider code).
- `src/server.ts` — **the server-safe entry point** (`@kira-joo/frontend-toolkit-core/server`) — no React-context code anywhere in its module graph. Use this for anything running in a Server Component or Route Handler.
- `src/api/app-error.ts` — the `AppError` model.
- `src/api/join-url.ts` — the base-URL + path joining helper (also used internally by `requester`).
- `src/cache/create-cache-policy-resolver.ts`, `src/config/create-lazy-env-base-url-config.ts` — the two generic patterns promoted from nutrition-client.

**Read first:** `src/server.ts` (see exactly what's safe server-side) before importing anything from this package into server-side code.

### `toolkit-common`

**Purpose:** zero-dependency shared vocabulary — types/enums/pure helpers used by both the frontend and backend toolkit families.

**Important files:** `src/localized.type.ts` (`LocalizedString`/`Localized<T>`), `src/resolve-localized.ts` (display-side locale resolution — the newest addition), `src/is-localized-complete.ts`/`src/find-incomplete-localized-paths.ts` (publish-gating, the write-side counterpart), `src/api-error.interface.ts`, `src/paginated-response.interface.ts`.

**Read first:** `src/localized.type.ts` then `src/resolve-localized.ts` — nearly everything bilingual in this ecosystem flows through these two files.

### `backend-toolkit-next`

**Purpose:** Next.js Route Handler factories — auth pipeline, DTO validation, deterministic response/error serialization, and (as of 0.4.0) declarative cache-tag revalidation.

**Important files:**
- `src/routes/create-route.ts` — **the core orchestrator**, read this first. Every route factory (`createGetRoute`/`createPostRoute`/`createPutRoute`/`createDeleteRoute`) is a thin wrapper around this.
- `src/routes/create-route-options.interface.ts` — the `CreateRouteOptions`/`RevalidateTagsContext`/`RevalidateTagsResolver` types.
- `src/routes/route-result-with-meta.ts` — `withRevalidationMeta`.
- `src/config/toolkit-config.ts` / `next-backend-toolkit-config.interface.ts` — the global config surface (`database`, `jwt`, `auth`, `cache`).
- `src/routes/create-route.test.ts` — the most complete example of every documented behavior, including the new `revalidateTags` suite. **Read the tests to understand the contract precisely.**

**Read first:** `src/routes/create-route.ts`, then its test file.

### `backend-toolkit-core`, `backend-toolkit-mongoose`, `backend-toolkit-cloudinary`

Not touched during this project's work so far beyond normal dependency consumption. `backend-toolkit-mongoose` is worth knowing about for its repository pattern (`createMongooseRepository`, `findAllAndCountPublic`/`findAllNoCountPublic`, `@MongoField`/`@Filterable`/`@Searchable`/`@Relation` decorators) since every nutrition-staff entity schema uses it.

### `frontend-toolkit-tailwind`

Not substantially touched during this project. Has genuinely reusable `AssetViewer`/`AssetLightbox`/`AssetThumbnail` and a generic `Timeline` component that Phase 6 is expected to reuse (per the master plan's toolkit-reuse decisions).

---

## 6. Toolkit architecture

### Package-first philosophy

Standing rule, restated verbatim from the instruction that established it: *"Before writing any generic (non-nutrition-specific) helper, hook, mapping function, or server/client abstraction, check whether `@kira-joo/frontend-toolkit-core` or `@kira-joo/toolkit-common` already provides it. If it does, consume it directly. If it's genuinely generic and doesn't exist yet, it belongs in the toolkit — implemented there, documented, exported, and consumed back — not built locally 'for now.'"* This applies to the backend toolkits too, as the `revalidateTags` refactor demonstrates.

### What belongs in a toolkit package

Anything with zero knowledge of nutrition-specific business rules — a data-shape helper (`resolveLocalized`), an error-classification model (`AppError`), a URL-joining utility (`joinUrl`), a generic mechanism with an opaque, app-supplied plugin point (`createCachePolicyResolver`, `revalidateTags`/`config.cache.publishRevalidation`).

### What stays application-specific

Concrete business values and domain types: `CacheTag`'s actual tag strings, `CACHE_POLICY`'s actual intervals, every `domain/*.ts` type (mirrors nutrition-staff's real response shapes), `PublicApiRoute`'s actual route strings, `publishRevalidation`'s actual HTTP-calling implementation (URL, secret, headers). **This was an explicit, repeated user rejection** — twice, the user was offered the option to move cache tags into `toolkit-common` and explicitly said no both times, with the same reasoning: toolkit packages must stay reusable across unrelated projects and carry zero nutrition-domain knowledge.

### Toolkit gaps found

- `frontend-toolkit-core`'s single-bundle barrel forcing React-context code into every import — **fixed** (the `/server` entry point).
- No display-side `LocalizedString` resolver anywhere in the ecosystem before this project — **fixed** (`toolkit-common`'s `resolveLocalized`).
- `requester` has no passthrough for Next's `fetch` cache/tag options — **not fixed, deliberately bypassed**: server-side reads use native `fetch` directly (`fetchPublic`), reserving `requester` for genuinely client-side interactive calls. This is a known, accepted architectural boundary, not a bug.
- `backend-toolkit-next` had no way to declare post-success side effects — **fixed** (`revalidateTags`).

### Reusable abstractions added this project

See §3's Phase 4 Pass 2 and Phase 5 Pass 2 write-ups for the full list with rationale: `resolveLocalized`/`isLocalizedFallback`, `AppError` family, `joinUrl`, `createCachePolicyResolver`, `createLazyEnvBaseUrlConfig`, `revalidateTags`/`withRevalidationMeta`/`config.cache.publishRevalidation`.

### Temporary workarounds

**None remain as of this handoff.** The four Pass-1 Phase-4 local reimplementations were deleted once `frontend-toolkit-core@0.5.0`'s `/server` entry made them unnecessary. The Phase-5 imperative revalidation calls were removed once `backend-toolkit-next@0.4.0`'s `revalidateTags` made them unnecessary. If a future workaround is genuinely needed temporarily, the established pattern is: build it locally, document *why* it's temporary and *what* upstream fix would remove it, and actually remove it once that fix lands — not leave it indefinitely.

---

## 7. Public website architecture (`nutrition-client`)

### Server rendering

Server Components fetch via `src/lib/data/*.ts` functions, which call `fetchPublic()` (`src/lib/api/fetch-public.ts`) — the one place every server-side CMS read goes through. Native `fetch`, not `requester` (see §6's toolkit-gaps note). `import "server-only"` on `fetch-public.ts` makes it a build error to accidentally import from a Client Component.

### Caching

Two concerns, two files: `src/lib/cache/cache-tags.ts` (the tag taxonomy — a hand-kept-in-sync duplicate of nutrition-staff's own `CacheTag`) and `src/lib/cache/cache-policy.ts` (fallback revalidate intervals, built on `frontend-toolkit-core`'s generic `createCachePolicyResolver`). Convention: the first tag in a multi-tag array is always the policy/domain tag; further tags are entity-level and participate in invalidation only.

### Cache tags

`SITE_SETTINGS`, `DOCTOR_PROFILE`, `PACKAGES_PAGE_SETTINGS`, `PACKAGES`, `RECIPE_CATEGORIES`, `RECIPE_FOOD_GROUPS`, `RECIPES` + `recipe(id)`, `REVIEWS`, `VIDEOS`, `FAQ`, `CAMPAIGNS` + `campaign(slug)`. Default fallback interval: one day. Campaigns are the one deliberate exception at 300s (a campaign's visibility can flip purely from wall-clock time crossing `endDate`, with zero underlying data change to trigger on-demand invalidation).

### On-demand revalidation

See §3 Phase 5 and §8 for the full design. From nutrition-client's side, the only piece is `src/app/api/revalidate/route.ts` — receives `{tags: string[]}`, authenticates via constant-time secret comparison, calls `revalidateTag()` per tag.

### Lead capture

`src/lib/mutations/use-consultation-request.ts` (`"use client"`) → `requester`/`useRequesterMutation` → this app's own `/api/consultation-requests` (never nutrition-staff directly) → nutrition-staff's real `POST /api/public/consultation-requests` → real CRM `Client`/`ClientProfile` creation. WhatsApp (not yet built in Phase 6) is meant to be the visitor-facing *continuation*, never the sole record and never shown as "success" ahead of backend confirmation — this is a master-plan requirement (§15) for Phase 6 to implement, not yet built.

### Endpoint organization

`api/public-api-route.ts` (top-level, sibling to `src/`) — every route string. `api/<domain>.endpoints.ts` — one file per domain, each exporting named `Endpoint<TSchema>` constants against `frontend-toolkit-core`'s real `Endpoint`/`MethodType` (imported from `/server` for server-side domains, from the root package for the one client-side consultation endpoint).

### Localization

next-intl for UI copy (versioned with the app, known at build time) — completely separate system from CMS content localization (`resolveLocalized`, live per-request data). Never conflate the two mechanisms.

### Data layer / composition layer

Data layer = `src/lib/data/*.ts` (built, Phases 4–5). Composition layer = `src/sections/*` (page-level composition, accepts already-fetched data as props) — **not yet built**, this is Phase 6.

---

## 8. `nutrition-staff` architecture

### Public endpoints

Everything under `src/app/api/public/**`, all `auth: false`, all `export const dynamic = "force-dynamic"`. 8 read domains + the composed FAQ endpoint + the consultation-requests write endpoint. Every bilingual field is `LocalizedString` (`{ar, en}`, both keys always present by schema default).

### Route factories

Every route imports `createGetRoute`/`createPostRoute`/`createPutRoute`/`createDeleteRoute` from `src/server/core/route-factories.ts` (a thin re-export of `@kira-joo/backend-toolkit-next`). The factory handles: config read → DB connect → auth → authorization → body/query/params parsing → DTO validation → handler execution → **`revalidateTags` resolution + publish** → response status resolution → response serialization. See `backend-toolkit-next/src/routes/create-route.ts` for the exact 9-step sequence (documented in its own top-of-file comment).

### Cache invalidation

See §3 Phase 5 Pass 2 for the full design. The short version: a route declares `revalidateTags` (static array or resolver function); `createRoute` calls it after the handler succeeds; the resolved, deduplicated tags are passed to `config.cache.publishRevalidation` (registered once in `toolkit.config.ts`, implemented in `src/server/core/revalidation/publish-revalidation.ts`). Best-effort — failures are logged (`console.warn`) and never turn a successful write into a failed response.

**Every entity's tag table lives in `src/server/core/revalidation/revalidate-entity.ts`** — read this file to see exactly which tags any given entity's routes bust. Campaign routes are the one genuinely dynamic case (see §9 for the exact pattern).

### Composed FAQ endpoint

`GET /api/public/faq` (`src/server/faq/get-public-faq.ts`) — joins `FaqSection`/`FaqItem` collections, filters both to `status: PUBLISHED`, sorts both by their `order` field, buckets items under their section by matching `item.section` (an unpopulated ObjectId — no `relations` needed, since items are only ever bucketed by id, never rendered with a full section object attached). Returns a narrower public shape (`PublicFaqSection`/`PublicFaqItem` in `src/common/interfaces/public-faq.interface.ts`) with no `order`/`status`/`createdAt`/`updatedAt`.

### Permission model

Not modified during this project. Existing `AppPermission` registry (`src/server/core/authorization/authorization-registry.ts`) — every authenticated route declares `auth: { permissions: [...] }`; a user with a `grantsAll` role bypasses permission checks entirely.

### Current feature branches

See §12 for exact commit hashes. As of this handoff: `main` has the Phase 4 Pass 2 (package-first) and Phase 5 Pass 1 (imperative revalidation) work merged in. The Phase 5 Pass 2 refactor (`revalidateTags`) sits on an **unmerged** `feature/on-demand-cache-invalidation` branch, ready for review.

---

## 9. Engineering conventions

Every convention below was either explicitly stated by the user during this project or is a direct, load-bearing consequence of one that was.

- **Package-first.** See §6. Check the toolkits before writing anything generic locally.
- **No duplicated generic code.** If two apps need the same generic logic, it goes in a toolkit once — never copy-pasted, never "for now" duplicated with a plan to fix later that doesn't actually happen. When a temporary workaround truly is unavoidable (e.g. waiting on an upstream fix), it must be documented as temporary and actually removed once the fix lands (see the barrel-bug story in §3/§6 for the full lifecycle of a workaround done right).
- **Backend owns business logic.** Grouping, sorting, filtering-to-published, joining related collections — anything that's "business logic about the data," not "how to render it" — belongs in nutrition-staff, never repeated by every frontend consumer. The FAQ composed-endpoint move (§3 Phase 4 Pass 2) is the canonical example.
- **Route constants, not string literals.** No `url`/`fetch` call site anywhere hardcodes an API path. nutrition-client: `api/public-api-route.ts`. nutrition-staff: each entity route file inlines its own literal once (matching nutrition-staff's own pre-existing convention — this is the one place a literal is acceptable, since it's the single definition site, not a repeated one).
- **A base URL owns the shared prefix; a route constant owns only the resource path.** Never both, never neither. Always join via `joinUrl`, never `new URL(path, base)` (see §3 Phase 4 Pass 2 for the exact bug this prevents).
- **Endpoint objects, not bare method+URL pairs.** Every API call site uses a named `Endpoint<TSchema>` constant (`api/<domain>.endpoints.ts`), never an inline path string passed straight to a fetch call.
- **Mobile-first design, equal quality bar across all three breakpoints.** Mobile is designed and validated *first* (sequencing), but tablet and desktop must each independently pass the same design-quality bar — not a "collapse in reverse" of the mobile layout. See master plan §6 for the explicit list of disallowed desktop failure modes.
- **GSAP is the sole animation engine.** Framer Motion was removed entirely in Phase 1, including from the one page that used it (`15-day-camp`, which folds into the generic campaign-block system anyway).
- **Tailwind-only styling.** No MUI/Emotion/`sx` anywhere in the rebuilt app.
- **Server/client separation is explicit and load-bearing, not incidental.** `import "server-only"` on server-only modules. Two separate config objects (`APIConfig` for client-side same-origin calls, `ServerApiConfig` for server-side upstream calls) specifically because they're both process-wide statics that would otherwise stomp on each other in the same Node process (Next.js evaluates `"use client"` modules server-side too, during SSR).
- **Cache strategy: tags identify *what*, policy decides *how stale*, invalidation decides *when to stop waiting*.** Three distinct concerns, three distinct files/mechanisms, never merged.
- **Clean architecture layering** (nutrition-client): `lib/data` (fetch) → `lib/domain` (types) → `sections` (composition, not yet built) → `app/[locale]` (thin route files). Repositories (nutrition-staff) are database-only — they never make external calls (e.g. cache invalidation) themselves; that's the route-factory layer's job, triggered only from an actual HTTP mutation, never from a migration/script/test/bulk operation that happens to call the same repository method.
- **Branch workflow.** Toolkits: commit directly to default branch. nutrition-client: work on `new-1`. nutrition-staff: **never push directly to `main`** — every feature gets its own `feature/<name>` branch, fully verified there, merged only by/at the user's explicit direction.
- **Verification means real, not code-inspection**, wherever practically possible. Starting explicitly from Phase 4 onward: run real dev/build servers, curl real endpoints, read real logs — state plainly when something genuinely can't be verified that way (e.g. the missing-admin-credentials gap in Phase 5) rather than silently substituting code review and calling it verification.
- **Ask before publishing a package, every time.** Even though this project has published multiple times, each publish was preceded by an explicit confirmation question — this is not a standing blanket approval, it's a per-instance one that happened to be granted every time so far.

---

## 10. Pending refactors / technical debt

| Item | Why postponed | What to do about it |
|---|---|---|
| **nutrition-staff's `package-lock.json` not regenerated against the real published `backend-toolkit-next@0.4.0`** | A GitHub Packages auth failure (401 on every package read, including `npm whoami`) started immediately after the 0.4.0 publish succeeded — an environment/credential problem, not something fixable from within the coding session. | Refresh the GitHub Packages token in `~/.npmrc`, then run a clean `npm install` on `feature/on-demand-cache-invalidation` to regenerate the lockfile for real, and re-run typecheck/build once more before merging to `main`. |
| **nutrition-staff still depends on stale `frontend-toolkit-core@^0.4.2`/`toolkit-common@^0.2.0`** | Out of scope for the work requested so far — nutrition-staff only consumes `LocalizedString` (type-only) from these today, so there's no functional break, just version drift. | Bump both once nutrition-staff needs anything from the newer versions (e.g. `resolveLocalized`), or as routine hygiene during a future phase. |
| **`requester`'s lack of Next fetch-option passthrough** | Deliberate architectural boundary (see §6), not a bug — but flagged in the master plan as a real gap worth eventually closing in the toolkit rather than permanently working around. | Revisit if/when a second app needs the same server-fetch-with-tags pattern `fetchPublic` implements — that repetition would be the signal it's time to promote. |
| **No `foodGroups` filter query param on the recipes list endpoint** | A confirmed backend gap noted since Phase 4; client-side post-filtering is the accepted, documented workaround (can under-fill a page after filtering). | Add the query param support to nutrition-staff's `ListRecipesQueryDto`/repository query when Phase 6 builds the recipe filter UI and the under-fill behavior becomes user-visible. |
| **No `featured` filter param on reviews** | Same category as above — a client-side "featured first" workaround is planned for Phase 6's reviews page. | Add if/when it becomes a real product problem. |
| **Dark mode structurally supported (`darkMode: "class"`) but not implemented** | No existing usage anywhere in the ecosystem; shipping it half-finished violates the project's "no half-finished implementations" standard. | Build only if explicitly requested — do not half-build speculatively. |
| **GSAP/ScrollTrigger plugin licensing not reconfirmed** | Flagged from the master plan's own knowledge-cutoff uncertainty (Webflow's 2025 GreenSock acquisition changed licensing terms). | Confirm current terms against GSAP's live documentation before Phase 6 depends on any specific plugin in production. |
| **`revalidateTags`'s generic mechanism could theoretically extend beyond cache invalidation** (any "run this after a successful mutation" cross-cutting concern — e.g. audit logging, webhooks) | Not requested; scope was explicitly cache invalidation only. | Do not speculatively generalize further until a second real use case actually needs it — this exact caution is itself a project convention (§9). |

---

## 11. Recommended reading order

For a new engineer or a fresh AI session picking this project up cold:

1. **This document, in full**, first. It's written specifically to orient without prior context.
2. **`nutrition-client/docs/architecture.md`** — the living technical doc for the public site's data/API/caching architecture. More granular and more likely to have been updated since this handoff than the summary in §7 above.
3. **The master plan** (`/Users/joe/.claude/plans/nutrition-client-purring-toucan.md`) — the full original design brief. Long, but it's the source of nearly every "why" behind a convention in §9. Skim it once fully, then keep it as a reference for whichever Phase 6 section you're building (it's organized by concern: IA/navigation, design system, mobile/tablet/desktop, card system, recipes, reviews, packages, doctor profile, campaigns, image/video delivery, animation, forms, empty states, error states, loading states, accessibility, SEO, performance, code architecture).
4. **`backend-toolkit-next/src/routes/create-route.ts` and its test file** — the single most-referenced piece of infrastructure in this handoff. Understanding this file's exact 9-step sequence makes every route file in nutrition-staff trivially readable.
5. **One representative nutrition-staff entity end to end** — e.g. `recipes`: `src/server/recipes/recipes.schema.ts` → `recipes.repository.ts` → `src/app/api/recipes/route.ts` + `[id]/route.ts` → `src/server/core/revalidation/revalidate-entity.ts`'s `RECIPES_TAGS`/`recipeDetailTags`. This one entity is a template for all the others.
6. **`nutrition-client/src/lib/data/recipes.ts`** and its sibling `api/recipes.endpoints.ts` — the frontend half of the same entity, showing how it's consumed.
7. **The campaign files** (nutrition-staff: `src/app/api/campaigns/**`, `src/server/core/revalidation/revalidate-entity.ts`'s campaign functions; nutrition-client: `src/lib/domain/campaign.ts`) — the one genuinely non-trivial case in the whole system (block-type discriminated union, slug-change cache invalidation via `withRevalidationMeta`). Worth understanding deliberately rather than picking up by osmosis from simpler entities.
8. **Then start wherever Phase 6 work is actually needed** — the master plan's §27 phase-6 sub-order (global layout → doctor → packages → FAQ → recipes → reviews/videos → campaigns → consultation) is the recommended build order, but each page's own master-plan section (§§4, 8–15) is the thing to actually read right before building that specific page.

**Why this order:** top-down architecture-then-infrastructure-then-example, so that by the time a new page needs to be built, its data source, its caching behavior, and its route-factory conventions are all already-understood tools, not things being learned mid-task.

---

## 12. Branches and commits

State as of this handoff (2026-08-06):

| Repo | Current branch | Latest commit | Notes |
|---|---|---|---|
| `nutrition-client` | `new-1` | `726529f` — "Phase 5: on-demand cache invalidation receiver" | Active working branch. |
| `nutrition-staff` | `main` | `61f80b7` — "Merge feature/on-demand-cache-invalidation into main" (the *first*, imperative-revalidation version) | **Safe to merge later:** `feature/on-demand-cache-invalidation` (recreated) — commit `2424a0d` — "Migrate all 38 mutation routes to declarative revalidateTags". **Not merged, awaiting review.** |
| `frontend-toolkit-core` | `master` (deliberately not renamed — see §1) | `e62896e` — "Use a domain-neutral path in joinUrl's test fixture" | Published as 0.5.0. |
| `toolkit-common` | `main` | `3eb65a5` — "Add resolveLocalized/isLocalizedFallback (0.3.0)" | Published as 0.3.0. |
| `backend-toolkit-next` | `main` | `f814831` — "Add declarative revalidateTags route option (0.4.0)" | Published as 0.4.0. **This publish succeeded**, immediately after which the registry started 401'ing on reads — see §2/§10. |
| `frontend-toolkit-tailwind` | `main` | `6ac5569` — "Fix absolutely-positioned descendants escaping scroll/clip containers to the document root" | Not touched this project; version 0.4.2 unchanged. |
| `backend-toolkit-core` | `main` | `d930db8` — "Bump toolkit-common peer range to ^0.2.0" | Not touched this project; version 0.3.4 unchanged. |
| `backend-toolkit-mongoose` | `main` | `3924a16` — "Bump toolkit-common peer range to ^0.2.0" | Not touched this project; version 0.3.2 unchanged. |
| `backend-toolkit-cloudinary` | `main` | `1c1abf9` — "Bump toolkit-common peer range to ^0.2.0" | Not touched this project; version 0.1.1 unchanged. |

**Repositories intentionally not merged:** `nutrition-staff`'s `feature/on-demand-cache-invalidation` (the `revalidateTags` migration) — explicit instruction: "Do not merge the nutrition-staff branch into main." The user reviews and merges nutrition-staff feature branches themselves.

**Repositories safe to merge later:** the above branch, once reviewed — it's fully typechecked, built, and tested; the only open item is regenerating `package-lock.json` against a real registry install once the auth blocker (§10) clears.

**Untracked, not-mine files present in the nutrition-staff working tree:** `DASHBOARD_PLAN.md` — belongs to unrelated, apparently-concurrent work (this machine has multiple Claude Code sessions with `--add-dir nutrition-staff` running). **Do not commit, delete, or modify this file** without confirming with the user first — it was deliberately left untouched throughout this project's git operations.

---

## 13. Known issues

**Open issues:**
- GitHub Packages registry auth failure in this environment (see §2/§10) — blocks a real `npm install` from the registry for `backend-toolkit-next@0.4.0` specifically (and, transiently, for every other `@kira-joo` package too, confirmed via `npm whoami` failing).
- No real authenticated-mutation smoke test exists for either Phase 5 pass, due to lacking real nutrition-staff admin credentials in this environment.

**Architectural limitations:**
- `requester` (frontend-toolkit-core) can't participate in Next's Data Cache (no `next: {revalidate, tags}` passthrough) — server reads permanently bypass it in favor of native `fetch`. This is accepted, not a bug to fix opportunistically.
- Cache tags are a hand-kept-in-sync duplicate between nutrition-client and nutrition-staff, by explicit design (see §6). If one side's tag strings drift from the other's, invalidation silently stops matching — there's no automated check for this today.
- The in-memory sliding-window rate limiter for the consultation-requests endpoint is single-instance only (documented limitation from Phase 4) — won't work correctly if nutrition-staff ever runs multiple instances without a shared store.

**Assumptions:**
- `NUTRITION_CLIENT_URL`/`REVALIDATE_SECRET` being unset in nutrition-staff's environment is treated as "feature not configured here" (silent no-op), not a configuration error — deliberate, so local development against a not-currently-running nutrition-client doesn't break every mutation.
- Campaign block sub-resource routes (add/replace/remove/reorder) assume the block-mutation function's return value always includes the campaign's current `slug` — true today (confirmed by reading every one of those functions), but would silently need updating if any of them ever stopped returning the full campaign document.

**Future improvements** (beyond what's in §10's table): none identified beyond what's already captured as pending tech debt.

---

## 14. Session notes

Context and reasoning that isn't obvious from the code alone:

- **The master plan is unusually load-bearing for this project.** Almost every non-obvious design choice in `nutrition-client`'s Phase 6+ work traces back to a specific numbered section of it. When in doubt about "should this be its own component" or "is this animation excessive," the master plan almost certainly already has an explicit answer — check it before improvising.
- **The barrel-bug story (Phase 4) is worth understanding as a pattern, not just a fixed bug.** The sequence was: hit a real blocker → build a documented, verified-correct temporary local workaround → keep shipping → once the real fix became available (a new toolkit version), delete the workaround completely and consume the fix. This is the template for how *any* future temporary workaround in this project should be handled — never a permanent local fork of toolkit logic.
- **Two explicit rejections of moving cache tags into `toolkit-common`** happened at different points in the project, worded almost identically both times. This is a strong, considered, repeated signal — not a one-off preference. Don't re-propose it a third time without a materially new argument.
- **"Ask before publishing" is per-instance, not a standing blanket approval**, even though every publish request so far in this project has been approved. Each of the ~4 publishes in this project (`toolkit-common` 0.3.0, `frontend-toolkit-core` 0.5.0, `backend-toolkit-next` 0.4.0, and the earlier `frontend-toolkit-core`/`toolkit-common` round) was preceded by an explicit `AskUserQuestion` confirmation. Continue asking every time, not just the first time.
- **The nutrition-staff branch-workflow rule arrived mid-project, retroactively.** Two feature branches (`feature/public-faq-composed-endpoint`, the first `feature/on-demand-cache-invalidation`) had already been merged into `main` by direct instruction *before* the standing "never push nutrition-staff to main" rule was stated. Don't be confused by `main`'s history containing merge commits from before the rule existed — the rule applies going forward, not retroactively.
- **The `revalidateTags` refactor was explicitly framed as "this works, but it's repetitive and easy to forget"** — i.e., the imperative Phase-5-Pass-1 version wasn't *wrong*, it was a real, working, fully-verified feature that got intentionally superseded for maintainability reasons once the pattern proved out across 38 real call sites. This is a useful precedent: a first, simpler implementation that gets replaced once its shape is proven is a legitimate and expected part of this project's process, not a sign the first attempt was a mistake.
- **This handoff document itself was explicitly requested in place of starting Phase 6** — the instruction was unusually explicit: finish the in-flight refactor, verify it, then stop and write this instead of continuing the roadmap. Whoever picks this project up next should treat Phase 6 as the actual next unit of work, with this document as the entire required context to start it.
- **Multiple concurrent Claude Code sessions share some of these working trees** (confirmed via `ps aux` showing several resumed sessions with overlapping `--add-dir` scopes, and the presence of `DASHBOARD_PLAN.md`/`CRM_PLAN.md` untracked files in nutrition-staff/frontend-toolkit-core that don't belong to this project's work). Any future session should `git status` before any branch-switching or destructive git operation, and never assume the working tree is in the exact state this document describes without checking first — that's a snapshot-at-write-time guarantee, not a live one.
