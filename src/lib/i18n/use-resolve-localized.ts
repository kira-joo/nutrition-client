"use client";
import { useLocale } from "next-intl";
import { isLocalizedFallback, resolveLocalized, type LocalizedString } from "@kira-joo/toolkit-common";
import { Locale } from "@/constant/Locale.enum";

// toolkit-common's `resolveLocalized`/`isLocalizedFallback` take the plain
// string-literal union `keyof LocalizedString` ("ar" | "en"). This app's
// `Locale` enum's runtime values are exactly those keys, but TypeScript
// treats a string enum as nominally distinct from that literal union, so
// indexing needs one explicit, deliberate cast rather than silently
// failing to compile.
type LocalizedLocale = keyof LocalizedString;
const toLocalizedLocale = (locale: Locale): LocalizedLocale => locale as unknown as LocalizedLocale;

/**
 * Client-Component sugar over toolkit-common's `resolveLocalized`/
 * `isLocalizedFallback`: reads the active locale once via next-intl's
 * `useLocale()` and returns `resolve`/`isFallback` bound to it, so a
 * component rendering many localized fields doesn't have to pass `locale`
 * to every call. Each still takes an optional `localeOverride` for the
 * rare case a component needs a locale other than the active one (e.g.
 * deliberately showing both languages side by side).
 *
 * Client Components only — Server Components can't call hooks at all; call
 * `resolveLocalized`/`isLocalizedFallback` directly from
 * `@kira-joo/toolkit-common` there, with the locale from the route param.
 */
export function useResolveLocalized() {
  const activeLocale = useLocale() as unknown as Locale;

  return {
    resolve: (value: LocalizedString | undefined | null, localeOverride?: Locale) =>
      resolveLocalized(value, toLocalizedLocale(localeOverride ?? activeLocale)),
    isFallback: (value: LocalizedString | undefined | null, localeOverride?: Locale) =>
      isLocalizedFallback(value, toLocalizedLocale(localeOverride ?? activeLocale)),
  };
}
