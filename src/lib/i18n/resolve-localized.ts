import type { LocalizedString } from "@kira-joo/toolkit-common";
import { Locale } from "@/constant/Locale.enum";

// toolkit-common doesn't export a `Locale` type of its own — `LocalizedString`
// is just `{ar: string, en: string}`. This app's `Locale` enum's runtime
// values ("ar"/"en") are exactly its keys, but TypeScript treats a string
// enum as nominally distinct from the plain string-literal union that
// `keyof LocalizedString` resolves to, so indexing needs one explicit,
// deliberate cast rather than silently failing to compile.
type LocalizedKey = keyof LocalizedString;
const toKey = (locale: Locale): LocalizedKey => locale as unknown as LocalizedKey;

/**
 * Resolves a CMS `LocalizedString` ({ar, en}) to a plain string for a
 * given locale — confirmed absent everywhere in the toolkit ecosystem
 * (toolkit-common only has write-side helpers, isLocalizedComplete/
 * findIncompleteLocalizedPaths; nothing resolves a value for display). A
 * strong candidate to eventually upstream into toolkit-common since it's
 * pure data-shape logic with zero framework dependency — not done yet, so
 * this app doesn't block on a package release.
 *
 * This is CMS-content resolution, a different system from next-intl's
 * UI-copy translation (src/hooks/useI18n.ts) — see docs/architecture.md
 * ("Public data flow") for why the two are kept separate.
 *
 * Honest fallback, not silent blankness: if the requested locale's value
 * is empty but the other locale has content, that content is returned
 * (labeled by the caller if it matters — e.g. reviews scraped from a
 * single-language source, a real and permanent state per the approved
 * plan, not a migration gap). If both are empty, an empty string is
 * returned — never a placeholder like "Untitled", which would look like
 * real content.
 *
 * Deliberately NOT in a "use client" file — this is the version Server
 * Components call directly, passing the locale they already have from the
 * route param. A file marked "use client" turns its plain function
 * exports into client references that aren't callable as regular
 * functions from a Server Component (confirmed during Phase 4
 * verification: calling this from a Server Component threw "resolveLocalized
 * is not a function" when it lived in a "use client" file) — Client
 * Components that want to avoid re-passing `locale` on every call use
 * `useResolveLocalized()` in use-resolve-localized.ts instead, which wraps
 * these same functions.
 */
export function resolveLocalized(value: LocalizedString | undefined | null, locale: Locale): string {
  if (!value) return "";

  const primary = value[toKey(locale)] ?? "";
  if (primary.trim().length > 0) return primary;

  const fallbackLocale = locale === Locale.AR ? Locale.EN : Locale.AR;
  return value[toKey(fallbackLocale)] ?? "";
}

/** True when the requested locale's value is empty but the other locale has real content — callers that want to label a fallback (e.g. "(original: Arabic)") check this first. */
export function isLocalizedFallback(value: LocalizedString | undefined | null, locale: Locale): boolean {
  if (!value) return false;
  const primary = value[toKey(locale)] ?? "";
  return primary.trim().length === 0;
}
