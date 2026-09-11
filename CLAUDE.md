# nutrition-client

The public website. The workspace constitution at `../CLAUDE.md` applies; this
file is a reading map plus the few rules that are easy to break from inside this
repo.

## Read the right doc before starting

This repo's `docs/` directory is the primary project reference. Each document has an explicit authority/status below; do not treat every visual document as immutable. Do not re-derive from code what
is already written down, and do not copy these into context wholesale — open the
one the task needs:

| Task | Read first |
|---|---|
| Anything touching data, API, caching, revalidation, i18n | `docs/architecture.md` |
| Visual/design work — palette, type, spacing, card families, contrast | `docs/design-system.md` — **current-state reference, not the redesign spec** |
| Writing actual styles — token names, Tailwind mappings, right/wrong usage | `docs/theme.md` — accurate for today's code; the vocabulary itself is open |
| Picking up the project cold, or asking "why is it like this" | `docs/HANDOFF.md` |

`docs/HANDOFF.md` is a snapshot, not a live document — its **non-visual
conventions** are authoritative, but its branch names, version numbers, and
"current phase" have moved on. Re-check facts against the repo.

**A genuine UI/UX redesign of this app is underway — not a reskin.** The visual
system in `design-system.md`/`theme.md` and the master plan's visual composition
rules are prior research and current-state documentation; they inform the
redesign rather than constraining it. The engineering architecture below is
unaffected and stays binding. The refactor and the redesign are **one pass**: do
not faithfully recreate old markup while cleaning up components. See
`.claude/skills/ui-design-and-redesign/SKILL.md` for the exact open/authoritative
split.

## The hard rules

- **The browser never talks to `nutrition-staff` directly**, in either
  direction. Server-side reads go through `src/lib/data/*` → `fetchPublic()`;
  the one write goes through this app's own proxy Route Handler. nutrition-staff
  has no CORS support, so this is not an optimisation — it is the only thing
  that works.
- **Import server-side toolkit code from
  `@kira-joo/frontend-toolkit-core/server`**, never the root entry. The root
  bundle carries React context code and crashes Server Component / Route Handler
  builds with `TypeError: createContext is not a function`.
- **No API path is hardcoded at a call site.** `api/public-api-route.ts` holds
  every route string; `api/<domain>.endpoints.ts` holds one `Endpoint` constant
  per domain. Placeholders are `:id`/`:slug`, not `[id]`/`[slug]`.
- **Join URLs with `joinUrl`, never `new URL(path, base)`** — the latter drops
  the base's path segment silently.
- **Tailwind only.** No MUI, no Emotion, no `sx`. All three are fully removed;
  do not reintroduce them.
- **Motion is the animation stack. GSAP is gone** — the dependency is
  uninstalled, `gsap-config.ts` is deleted, and no source file imports it. New
  animation work uses Motion (`motion`, or `motion/react` for React — never
  `framer-motion`), or plain CSS/native transitions where those are sufficient.
  Do not reintroduce a second animation engine.
- **Motion tokens stay the single source of durations and eases**, from
  `src/lib/animation/motion-tokens.json`. Never hardcode either, and never
  hand-edit the generated `src/app/_generated/motion-tokens.css`. The reshaping
  layer in `motion-tokens.ts` now emits Motion-shaped values (seconds, and
  cubic-bezier arrays parsed from the same JSON the CSS is generated from).
  See `docs/motion-system.md` for which of the six motion layers owns what.
- Reduced motion, RTL, accessibility, performance, and first-render stability are
  required for any animation, on either stack. Use the `motion` skill.
- **next-intl for UI copy, `resolveLocalized` for CMS content.** Two separate
  systems — UI copy is versioned with the app and known at build time, CMS
  content is live per-request data. Never route one through the other.

## Locale and direction

Arabic is the default locale and the site is **RTL by default**
(`src/i18n/routing.ts`, `localeDetection: false` — `/` always resolves to
Arabic). Every route lives under `src/app/[locale]/**`; there is no root layout
outside the locale segment.

Check every layout change in both `/ar` and `/en`. Use CSS logical properties
rather than branching on direction; reserve `useIsRtl()` for genuine authorial
layout decisions.

## Caching

Three distinct concerns, three files, never merged: `cache-tags.ts` (the tag
taxonomy — a hand-kept-in-sync duplicate of nutrition-staff's `CacheTag`),
`cache-policy.ts` (fallback revalidate intervals), and
`src/app/api/revalidate/route.ts` (the on-demand invalidation receiver).

Convention for multi-tag calls: the **first** tag is the policy/domain tag; any
further tags are entity-level and participate in invalidation only.

## Branches

Implementation work happens on **`staging`**, branched from `master` (this repo's
default branch is `master`, not `main`). Commit and push to `staging` freely.
**Never merge `staging` into `master`** — the user handles that personally.

The older `new-1` working branch is historical; `docs/HANDOFF.md` §9 carries the
current policy.

## Verification

Real browser verification is part of this repo's definition of done, at 375/768/
1440 in both locales. See `.claude/skills/browser-visual-qa/SKILL.md` — including
the horizontal-overflow false positive, which is a documented trap here.

## Rulings inherited from the old root constitution

These were workspace-level rules until the root `CLAUDE.md` was generalised.
They are Nutrition product decisions, so they live here now.

**Cache tags stay app-local.** `CacheTag`'s tag strings, `CACHE_POLICY`'s
intervals, every `domain/*.ts` type, `PublicApiRoute`'s route strings, and
`publishRevalidation`'s HTTP implementation are deliberately not shared.
Promoting cache tags to `toolkit-common` has been **proposed twice and rejected
both times** — do not re-propose without a materially new argument.

**The master design brief** at
`/Users/joe/.claude/plans/nutrition-client-purring-toucan.md` is optional
historical context, **not authority**. It lives outside the workspace, on one
machine, unversioned with the repositories — treat it as unavailable by default.
When present it is useful for architectural and product history, but load only
the section a task needs and never let a decision depend on it. Anything from it
that turns out to be load-bearing should be written into this repo's `docs/`
instead. **Its visual composition rules are not binding on the redesign.**

**The Books Flipbook is a preserved successful experience.** It is not
redesigned as part of the current work unless the new surrounding design creates
an inconsistency that genuinely requires it — and it is not a visual source of
truth for the rest of the site either.

**Two scheduled `apple-design-skill` audits** are planned for this app: a first
pass at the next meaningful visual checkpoint once the refactor/foundation work
is coherent, and a full-site pass at the end of the redesign as a final quality
gate. See the root constitution for how findings must be classified.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
