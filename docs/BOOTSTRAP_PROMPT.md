You are joining an in-progress software project. Do not start coding, do not propose changes, and do not summarize anything back to the user yet. Your first job is to onboard yourself.

## Step 1 — Read, in this order

1. `nutrition-client/docs/HANDOFF.md` — read this **in full** first. It is your primary source of historical context: architecture, phase-by-phase history with rationale, remaining roadmap, repository map, toolkit conventions, pending tech debt, exact branch/commit state across every repository, known issues, and session notes that aren't obvious from the code alone. Treat it as authoritative for *why* things are the way they are.
2. `nutrition-client/docs/architecture.md` — the living technical doc for the public site's data/API/caching architecture. More granular than HANDOFF.md's summary and may have been updated more recently.
3. `nutrition-client/docs/design-system.md` and `nutrition-client/docs/theme.md` — the full design-token system (color, type, spacing, containers, radii, shadows, motion, z-index, focus rings, touch targets, etc.).
4. The master implementation plan at `/Users/joe/.claude/plans/nutrition-client-purring-toucan.md`. This is long — skim it fully once, then treat it as a reference you return to per-section as you work. Almost every non-obvious design decision made so far traces back to a specific numbered section of this file.
5. `backend-toolkit-next/src/routes/create-route.ts` and its test file `create-route.test.ts` — the core Next.js Route Handler orchestrator every backend route in `nutrition-staff` is built on, including the declarative `revalidateTags` cache-invalidation option. Understanding this file makes every route file in `nutrition-staff` trivially readable.
6. One representative `nutrition-staff` entity end to end, e.g. `recipes`: its schema → repository → route files (`src/app/api/recipes/route.ts` + `[id]/route.ts`) → its tag definitions in `src/server/core/revalidation/revalidate-entity.ts`. Then read the matching frontend half: `nutrition-client/src/lib/data/recipes.ts` + `api/recipes.endpoints.ts`. This one entity is a template for every other entity in the system.
7. The campaign files on both sides (`nutrition-staff/src/app/api/campaigns/**`, the campaign functions in `revalidate-entity.ts`; `nutrition-client/src/lib/domain/campaign.ts`) — the one genuinely non-trivial case in the system (a block-type discriminated union, and slug-change cache invalidation via `withRevalidationMeta`). Worth deliberately understanding rather than picking up by osmosis.
8. Any other file HANDOFF.md's "Repository map" (§5) or "Recommended reading order" (§11) points you to for the specific area you end up working in.

## Step 2 — Understand before you touch anything

Before writing or proposing a single line of code, make sure you can explain back to yourself (not necessarily to the user):

- **The overall architecture**: which repository owns which concern, how `nutrition-client` (public site) and `nutrition-staff` (CMS/CRM backend) talk to each other, and why the browser never calls `nutrition-staff` directly.
- **The package-first / toolkit-first philosophy**: before writing anything generic, you check whether `frontend-toolkit-core`, `toolkit-common`, or `backend-toolkit-next` already provides it. Generic code that doesn't exist yet gets built *in the toolkit* and consumed back — never duplicated locally "for now." Concrete business values (cache tag strings, route strings, domain types) stay local to the app that owns them and are never moved into a toolkit, even for convenience.
- **The branch workflow**: toolkit packages commit directly to their default branch. `nutrition-client` works on branch `new-1`. `nutrition-staff` **never** gets pushed directly to `main` — every feature lives on its own `feature/<name>` branch, fully verified there, and is only merged into `main` by the user's explicit direction.
- **The cache architecture**: three distinct, deliberately separate concerns — tag taxonomy (what to invalidate), revalidation policy (fallback staleness window), and on-demand invalidation (the `revalidateTags` route-factory option + `publishRevalidation`). Never merge these concerns.
- **Route factories**: every `nutrition-staff` route is built via `createGetRoute`/`createPostRoute`/`createPutRoute`/`createDeleteRoute` from `backend-toolkit-next`, which handles auth, validation, response serialization, and now declarative cache-tag revalidation in one fixed pipeline.
- **The public/backend boundary**: `nutrition-client` Server Components read through `src/lib/data/*.ts` → `fetchPublic()`, tagged and cached. The one write path (consultation form) proxies through `nutrition-client`'s own Route Handler, never hitting `nutrition-staff` from the browser.
- **The remaining roadmap**: HANDOFF.md §4 describes every remaining phase (6 through 10) in detail — objective, order, dependencies, risks, acceptance criteria.

If anything in HANDOFF.md conflicts with what you observe in the actual code, **trust the code** — HANDOFF.md is a snapshot at a point in time, not a live source of truth. Confirm drift with the user rather than silently picking one or the other.

## Step 3 — Where to actually pick up

The project is between Phase 5 and Phase 6. Phases 1 through 5 are complete, approved, and — per HANDOFF.md §3 — some of them were already revisited and refactored once each after initial approval (this was intentional, not a sign the first attempt was wrong). **Do not re-audit, redesign, or second-guess any completed and approved phase's decisions** unless the user explicitly asks you to revisit one. Continue exactly from the current checkpoint: **Phase 6 — per-content-type integration** (building the actual public pages against the already-complete data/caching layer). HANDOFF.md §4 gives the recommended build order for Phase 6; follow it unless told otherwise.

## Step 4 — Conventions you must preserve

HANDOFF.md §9 documents every engineering convention established so far — package-first, no duplicated generic code, backend owns business logic, route constants (never inline path strings), a base URL owns the shared prefix while a route constant owns only the resource path, endpoint objects (never bare method+URL pairs), mobile-first with an equal quality bar across breakpoints, Motion as the animation stack of record with GSAP as legacy pending migration (this convention was updated 2026-08-19 — HANDOFF §9 has the current wording), Tailwind-only styling, explicit server/client separation, the three-part cache strategy, the branch workflow above, and "verification means real, not code-inspection" wherever practically possible. Follow all of them without being re-told. If a new situation doesn't cleanly fit an existing convention, say so explicitly and ask rather than inventing a new pattern silently.

## Step 5 — Always ask before

Regardless of how routine any of these feel, stop and ask the user for explicit approval before:

- **Publishing any toolkit package** to the registry (even a small, obviously-correct change). This project's standing pattern is to ask every single time, not just the first time.
- **Merging any `nutrition-staff` feature branch into `main`.** That merge is always the user's call, never yours to make unilaterally.
- **Making any architectural change that touches more than one repository** — e.g. changing a shared type, a cache-tag contract, or a cross-app API shape. Propose the change and its blast radius first; don't implement across repositories speculatively.

Once you've done Steps 1–2 and can accurately describe the current state back to yourself, tell the user you're oriented and ask what they'd like to start with in Phase 6 — don't assume, and don't start writing page code before that check-in.
