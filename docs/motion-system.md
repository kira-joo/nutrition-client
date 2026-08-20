# Motion system

The animation contract for `nutrition-client`. Motion (`motion`, imported as
`motion/react` for React — never `framer-motion`) is the engine; GSAP is being
retired. Durations and eases come from `src/lib/animation/motion-tokens.json`
and nowhere else.

The goal is a site that feels alive and premium. The method is **restraint with
intent**: every motion pattern below has one job, and a surface uses the fewest
patterns that do that job. Motion that does not support hierarchy, storytelling,
or interaction feedback is decoration, and decoration is what makes a site feel
generated rather than designed.

## The six layers

Each layer has its own timescale, its own trigger, and its own token family. A
surface may combine layers, but never two patterns from the same layer.

| # | Layer | Job | Trigger | Tokens |
|---|---|---|---|---|
| 1 | **Entrance** | Establish reading order as content arrives | Scroll-in, once | `reveal` / `emphasized`, stagger 0.08s |
| 2 | **Ambient** | Make a decorative surface feel alive | Continuous | `ambient-drift` / `ambient` ease |
| 3 | **Scroll-linked** | Depth and spatial hierarchy | Scroll progress | No duration — progress-bound, linear |
| 4 | **Interaction** | Confirm a control responded | Hover / press / focus | `fast`–`base` / `standard` |
| 5 | **State** | Explain where a surface came from | Open / close | `base`, `emphasized` in, `standard` out |
| 6 | **Data** | Let a number land as a fact | Scroll-in, once | `count` / `soft` |

### 1. Entrance — `Reveal` / `RevealGroup`

Already the site's baseline, via `useScrollReveal` / `useStaggerReveal`. Fires
**once**; never re-triggers on scroll-back. A group shares one viewport observer
and staggers its children — never one observer per card, which on a
single-column mobile layout is pure additive latency.

Rules: one reveal per logical block, not per element. Distance stays small
(16–32px); a long travel reads as sluggish, not elegant. Duration scales to
0.75× below 768px.

### 2. Ambient — decorative surfaces only

A slow, low-amplitude, continuous loop on a purely decorative element (the hero
artwork's breathe, a botanical accent). Timescale is **tens of seconds**, which
is why `ambientMs` is a separate scale from the sub-second interactive tokens.

Rules: amplitude small enough that a user cannot consciously track it (≤5%
scale, ≤8px translate). Never on text, never on anything carrying information,
never more than one ambient element in a viewport. Must be a genuinely
continuous loop — a visible restart is worse than no motion.

### 3. Scroll-linked — parallax and depth

Bound to scroll progress, not to a clock, so it never has a duration or an ease
beyond linear. Desktop-only where the effect depends on viewport height that
mobile does not have.

Rules: **explicit transform ownership.** If an element already carries an
ambient transform, the scroll-linked transform must compose with it deliberately
(separate elements, or one element with both values written by the same owner) —
never two independent animations fighting over one `transform`. This is the
single highest-risk pattern in the system and the one that must be measured, not
eyeballed.

### 4. Interaction — hover, press, focus

Prefer plain CSS transitions with the Tailwind `duration-*`/`ease-*` utilities
generated from the same tokens; reach for Motion only when CSS genuinely cannot
express it. Card and image depth belongs here: a small lift plus a slight media
scale, nothing more.

Rules: hover elevation **must** use the `pointer:` variant
(`@media (hover: hover) and (pointer: fine)`) — bare `hover:` sticks after a tap
on touch devices. Focus states are never animated away and never depend on
motion being enabled.

### 5. State — drawers, dropdowns, dialogs

Directional: a surface enters from the edge it is docked to and leaves the same
way, so its origin is legible. `emphasized` opening (decisive), `standard`
closing (unobtrusive). Interruptible — a reversal mid-animation must not restore
an obsolete state.

Rules: the offscreen direction resolves from `document.documentElement.dir` **at
animation time**, never hardcoded, or RTL slides from the wrong side. Visibility
is written alongside opacity so a fade-out is actually visible (an opacity-only
fade loses to a same-tick `invisible` class). Accessibility behaviour — focus
trap, focus restore, scroll lock, background inert — is independent of animation
and must never depend on `prefers-reduced-motion`.

### 6. Data — count-up

A stat animating from 0 to its real value as it enters view, once. Needs ~1.4s
(`count`) to read as counting rather than flickering — deliberately slower than
any interactive token.

Rules: the **real final value must be in the server-rendered HTML** and must be
what a screen reader announces; the count is a visual enhancement over text that
is already correct and already there. Digits use `tabular-nums` so the layout
does not jitter. Arabic-Indic numerals must count correctly, not fall back to
Western digits.

## prefers-reduced-motion

Not a downgrade path — a first-class mode. Under `reduce`:

- Layers 1, 2, 3 and 6 do not run at all. Content renders at its final state
  immediately; ambient and parallax simply do not start.
- Layers 4 and 5 keep their **outcome** but lose their transition: a drawer still
  opens and closes, instantly.
- Nothing becomes unreachable, and no information is only conveyed by motion.

The preference is read through `usePrefersReducedMotion()`, which subscribes to
live changes — Motion's own `useReducedMotion()` snapshots once at mount and
never updates, which silently broke mid-session toggling.

## Non-negotiables

- **No new GSAP.** Motion or CSS.
- **Never hardcode a duration or an ease.** Tokens only, from the JSON.
- **RTL is composition, not `text-align`.** Any motion with a horizontal
  component mirrors: use logical properties, or resolve direction at runtime.
- **Degrade to visible.** If JS fails or hydration never happens, content must
  not be stranded at `opacity: 0`.
- **Verify in a browser, at 375/768/1440, in `/ar` and `/en`, with reduced
  motion both off and on.** Measure geometry; do not judge motion from a static
  screenshot.
