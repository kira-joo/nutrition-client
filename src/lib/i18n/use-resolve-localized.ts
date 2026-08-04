"use client";
import { useLocale } from "next-intl";
import type { LocalizedString } from "@kira-joo/toolkit-common";
import { Locale } from "@/constant/Locale.enum";
import { isLocalizedFallback, resolveLocalized } from "@/lib/i18n/resolve-localized";

/**
 * Client-component sugar over resolve-localized.ts: reads the active
 * locale once via next-intl's `useLocale()` and returns `resolve`/
 * `isFallback` bound to it, so a component rendering many localized
 * fields doesn't have to pass `locale` to every call. Each still takes an
 * optional `localeOverride` for the rare case a component needs a locale
 * other than the active one (e.g. deliberately showing both languages
 * side by side).
 *
 * Client Components only — Server Components can't call hooks at all;
 * use `resolveLocalized(value, locale)` directly there with the locale
 * from the route param (see that function's own file, which deliberately
 * has no "use client" directive for exactly this reason).
 */
export function useResolveLocalized() {
  const activeLocale = useLocale() as unknown as Locale;

  return {
    resolve: (value: LocalizedString | undefined | null, localeOverride?: Locale) =>
      resolveLocalized(value, localeOverride ?? activeLocale),
    isFallback: (value: LocalizedString | undefined | null, localeOverride?: Locale) =>
      isLocalizedFallback(value, localeOverride ?? activeLocale),
  };
}
