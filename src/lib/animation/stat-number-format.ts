import type { Locale } from "@/constant/Locale.enum";

/**
 * The one number formatter the stats band uses, on both the server and the
 * client.
 *
 * It exists because the two disagreed. `Intl.NumberFormat("ar")` resolves its
 * numbering system from the platform's ICU data, and the platforms differ:
 * Node returns the `arab` system (١٬٢٥٠) while Chrome returns `latn` (1,250).
 * Formatting the final value on the server and the counting frames in the
 * browser therefore produced Arabic-Indic digits for a screen reader and
 * Western digits on screen, from the same number — measured, not theorised.
 *
 * `latn` is pinned rather than picked, because it is what this site already
 * ships: every existing Arabic number is Western — "صفحة 1 من 2", "14 وصفة",
 * "30 دقيقة". A stats band counting in ٠١٢٣ beside a pager reading 1 من 2 would
 * be the inconsistency, not the fix.
 *
 * Note this contradicts `docs/motion-system.md`'s layer-6 rule, which assumes
 * Arabic-Indic digits. That rule was written before any numeric surface existed;
 * the implementation now shows the assumption was wrong. Switching the whole
 * site to Arabic-Indic is a product decision, and if it is taken this is the one
 * line to change.
 *
 * The locale is still passed so locale-specific grouping and decimal separators
 * survive — only the digit set is pinned.
 */
export function statNumberFormat(locale: Locale, decimals = 0): Intl.NumberFormat {
  return new Intl.NumberFormat(locale, {
    numberingSystem: "latn",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** How many decimals a stat should hold on to while counting. */
export function decimalsFor(value: number): number {
  return Number.isInteger(value) ? 0 : String(value).split(".")[1]?.length ?? 1;
}
