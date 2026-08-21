/**
 * The card/panel surface treatment, as composable class strings.
 *
 * Deliberately **not** a `<Surface>` component, which is what doc 04 planned.
 * Reading all fifteen occurrences first — which that doc requires — showed the
 * shells sit on five different elements: three `Link`s, an `<a>` inside a
 * horizontal scroller, an `<article>`, and a `<dl>`. A component would therefore
 * need `as`/`asChild` polymorphism to serve any of them, and would hand back
 * exactly the class string it was given. What actually repeats is the treatment,
 * not the element, so that is what is shared.
 *
 * Class *constants* rather than a builder that interpolates them: Tailwind finds
 * candidates by scanning source text, so every class has to appear literally
 * somewhere. `cn(SURFACE_RAISED, SURFACE_HOVER_ELEVATION)` at the call site keeps
 * them visible; a template that assembled `rounded-${x}` would not.
 */

/** Card/panel fill for content that sits above the page — the default. */
export const SURFACE_RAISED = "rounded-xl border-hairline border-border bg-surface";

/** Recessed panel for a container whose content is absent or secondary. */
export const SURFACE_MUTED = "rounded-xl border-hairline border-border bg-surface-muted";

/**
 * Hover elevation for a card-like surface.
 *
 * Named for the treatment rather than for "interactive", because the review card
 * carries it on a non-interactive `<article>` — the whole card is not a link
 * there, but it still lifts under the cursor.
 *
 * **`pointer:hover:` and never bare `hover:`.** On a touch device a bare hover
 * state latches when tapped and stays until something else is tapped, so a
 * visitor who taps a card and comes back finds it stuck looking elevated. This
 * app registers the `pointer:` variant
 * (`@media (hover: hover) and (pointer: fine)`) for precisely that reason, and
 * five surfaces had never been moved onto it: the book, video and recipe cards,
 * the gallery filmstrip and the review card. Only `pricing-card` had it right.
 *
 * `transition-shadow` stays outside `motion-safe:` because it matches what these
 * cards already did; the reduced-motion question here is about movement, and a
 * shadow crossfade on hover is not that.
 *
 * The lift is the other half of the layer-4 gesture (see `SURFACE_MEDIA_ZOOM`).
 * Its transform is ungated and only the combined transition is `motion-safe:` —
 * under `reduce` the card still lifts, it just arrives instantly. Two
 * transition utilities on one element would overwrite each other, which is why
 * the motion-safe one names both properties explicitly rather than adding a
 * second `transition-transform`.
 *
 * `motion-safe:duration-base` and `motion-safe:ease-standard` are not
 * redundant. Every Tailwind `transition-*` utility also writes a 150ms default
 * duration and its own ease, so the second transition utility silently reset
 * both — measured at 0.15s in the browser, when the token says 300ms. Restating
 * them under the same variant is what keeps the token in charge.
 */
export const SURFACE_HOVER_ELEVATION =
  "shadow-sm transition-shadow duration-base ease-standard motion-safe:transition-[box-shadow,transform] motion-safe:duration-base motion-safe:ease-standard pointer:hover:shadow-md pointer:hover:-translate-y-0.5";

/**
 * The other half of the same gesture: the card's media easing in slightly while
 * the card itself lifts. `docs/motion-system.md` specifies layer 4 for a card as
 * "a small lift plus a slight media scale, nothing more", and this is the scale.
 *
 * Belongs on the **media**, never on the shell that carries
 * `SURFACE_HOVER_ELEVATION`. That separation is deliberate: the motion system
 * calls competing transforms on one element its highest-risk pattern, so the
 * lift owns the card's transform and the zoom owns the image's, and neither can
 * overwrite the other. It needs an `overflow-hidden` ancestor to crop against,
 * which all five surfaces already have.
 *
 * Two things here that the existing copies of this treatment got wrong. The
 * review card and the gallery filmstrip already scaled their media, but with a
 * bare `group-hover:` and no reduced-motion gate — so the zoom latched after a
 * tap on a phone, and ran for a visitor who had asked the system for less
 * movement. Both rules are in the motion system already; these two surfaces
 * simply predated them. `pointer:` is what fixes the latch and `motion-safe:` on
 * the transition is what fixes the second; sharing one string is what stops the
 * next card drifting the same way.
 *
 * **The transform is ungated; only its transition is `motion-safe:`.** That
 * split is the motion system's rule for this layer and it is easy to get
 * backwards — I did, first time round, and gated the transform itself. Layers 4
 * and 5 "keep their outcome but lose their transition": a hover state is
 * feedback that a control responded, so under `reduce` the card must still lift
 * and the media must still ease in, they just arrive instantly instead of over
 * 300ms. Gating the transform removes the feedback entirely, which is a
 * different thing from removing the movement.
 *
 * The same split applies to the shell's lift in `SURFACE_HOVER_ELEVATION`, where
 * `transition-shadow` stays ungated (a shadow crossfade is not movement) and
 * only the combined `box-shadow,transform` transition sits behind `motion-safe:`.
 */
export const SURFACE_MEDIA_ZOOM =
  "motion-safe:transition-transform motion-safe:duration-base motion-safe:ease-standard pointer:group-hover:scale-105";
