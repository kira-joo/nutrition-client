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
 */
export const SURFACE_HOVER_ELEVATION =
  "shadow-sm transition-shadow duration-base ease-standard pointer:hover:shadow-md";
