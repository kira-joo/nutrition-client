"use client";
import { useCallback } from "react";
import { useCountUp } from "@/lib/animation/use-count-up";
import { decimalsFor, statNumberFormat } from "@/lib/animation/stat-number-format";
import type { Locale } from "@/constant/Locale.enum";

export interface StatFigureProps {
  value: number;
  suffix?: string;
  /**
   * Needed here despite the homepage's "locale goes to the data layer, not into
   * sections" rule. That rule is about *content* localization — resolving
   * `{ ar, en }` — and this is number formatting, which has to produce the same
   * digits the server already put in the HTML. See `statNumberFormat`.
   */
  locale: Locale;
  /** Already-formatted final value from the server, used verbatim until the count starts. */
  formatted: string;
}

/**
 * The animating half of a stat. Deliberately the only client component in the
 * band — the label, the layout and the real values are all server-rendered.
 *
 * Two accessibility points, both from `docs/motion-system.md`'s layer 6 rules:
 *
 * The animating text is `aria-hidden`, with the real figure alongside it in a
 * visually-hidden span. A screen reader therefore hears the final value once,
 * not a stream of intermediate numbers, and hears it whether or not the count
 * ever runs. `formatted` comes from the server, so that value is in the HTML
 * before any JavaScript executes.
 *
 * `tabular-nums` keeps the glyphs the same width as they change, so a figure
 * counting from 0 to 1,250 does not shuffle its own layout — and neither does
 * the label beside it.
 *
 * Both sides go through `statNumberFormat`, which pins the digit set. Leaving it
 * to the platform gave Arabic-Indic on the server and Western in the browser for
 * the same figure.
 */
export function StatFigure({ value, suffix, locale, formatted }: StatFigureProps) {
  /**
   * Intermediate frames are rounded to the target's own precision: an integer
   * stat must not flicker through 731.4182, and a 4.9 must not round to 5 while
   * counting. Memoised because `useCountUp` re-runs its effect when the
   * formatter identity is not stable.
   */
  const format = useCallback(
    (current: number) => statNumberFormat(locale, decimalsFor(value)).format(current),
    [value, locale],
  );

  const { ref, display } = useCountUp(value, format);

  return (
    <span ref={ref} className="tabular-nums">
      <span aria-hidden="true">
        {display}
        {suffix}
      </span>
      <span className="sr-only">
        {formatted}
        {suffix}
      </span>
    </span>
  );
}
