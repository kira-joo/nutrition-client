/**
 * Shared between every carousel's prev/next/autoplay control (the
 * `/reviews` featured strip and the homepage testimonial carousel) so the
 * two can't drift into two slightly different button treatments for the
 * same job.
 *
 * `touch:` grows these to a real 44px target on a coarse pointer — 36px
 * measured below the app's own `--touch-target-min`. Gated on pointer
 * capability rather than a viewport breakpoint, because a wide touch
 * tablet passes `sm:` and still has no mouse; `control-md` is 2.75rem, the
 * same value `--touch-target-min` resolves to, so this is the token
 * agreeing with itself rather than a magic number.
 */
export const CAROUSEL_CONTROL_BUTTON_CLASS =
  "flex h-control-sm w-control-sm items-center justify-center rounded-full border-hairline border-border bg-surface text-text-primary transition-colors duration-base ease-standard pointer:hover:border-primary pointer:hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 touch:h-control-md touch:w-control-md";
