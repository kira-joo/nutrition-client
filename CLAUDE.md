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
- **Motion is the target animation stack; GSAP is legacy.** New animation work
  uses Motion (`motion/react` — never `framer-motion`), or plain CSS/native
  transitions where those are sufficient. GSAP is still installed and still
  drives the existing animation code, so it must keep working until migrated —
  but do not add new GSAP code, and do not keep both stacks without a concrete,
  verified technical reason. Where a specific GSAP behaviour genuinely cannot be
  reproduced safely with Motion or CSS, document the exception.
- **Motion tokens stay the single source of durations and eases**, from
  `src/lib/animation/motion-tokens.json`. Never hardcode either, and never
  hand-edit the generated `src/app/_generated/motion-tokens.css`. Note the
  reshaping layer in `motion-tokens.ts` currently emits GSAP-shaped values
  (seconds + GSAP ease strings) — migrating that is part of the Motion work, not
  a licence to bypass the tokens.
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
