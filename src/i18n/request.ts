import { getRequestConfig } from "next-intl/server";
import { IntlErrorCode, type IntlError } from "next-intl";
import { routing } from "./routing";
import { DictionaryFiles } from "@/constant/DictionaryFiles";

/**
 * Namespace -> JSON file map. Adding a namespace means adding one entry
 * here, the matching `en`/`ar` JSON files under `./locales`, and the type
 * in `src/types/next-intl.d.ts` — all three, or `useTranslations` calls
 * won't type-check. Namespaces are removed the same way, as each legacy
 * page is rebuilt and its copy stops being referenced.
 */
const NAMESPACE_FILES = {
  [DictionaryFiles.Home]: "home",
  [DictionaryFiles.SendMessage]: "send-message",
  [DictionaryFiles.Recipes]: "recipes",
  [DictionaryFiles.Calculator]: "calculator",
  [DictionaryFiles.Packages]: "packages",
  [DictionaryFiles.Faq]: "faq",
  [DictionaryFiles._15DayCamp]: "15-day-camp",
  [DictionaryFiles.Layout]: "layout",
  [DictionaryFiles.Videos]: "videos",
  [DictionaryFiles.Reviews]: "reviews",
} as const;

async function loadMessages(locale: string) {
  const entries = await Promise.all(
    Object.entries(NAMESPACE_FILES).map(async ([namespace, file]) => {
      const messages = (await import(`./locales/${locale}/${file}.json`)).default;
      return [namespace, messages] as const;
    })
  );
  return Object.fromEntries(entries);
}

/**
 * Missing-translation fallback policy (there was no equivalent explicit
 * policy under i18next — this makes it one):
 *   - A missing key never crashes rendering, in development or production.
 *   - In development, it's logged loudly (console.error) so it's caught
 *     before merge, not discovered by a translator or a user.
 *   - In production, it's logged quietly (console.warn, not thrown) and
 *     the rendered fallback is the dot-path key itself in brackets (e.g.
 *     `[missing: reviews.title]`) — visibly wrong rather than silently
 *     blank, so a missing translation is a bug report, not an invisible
 *     gap. This never fabricates content in the other locale.
 */
function onError(error: IntlError) {
  if (error.code === IntlErrorCode.MISSING_MESSAGE) {
    if (process.env.NODE_ENV === "development") {
      console.error(error);
    } else {
      console.warn(error.message);
    }
    return;
  }
  console.error(error);
}

function getMessageFallback({ namespace, key }: { namespace?: string; key: string }) {
  const path = namespace ? `${namespace}.${key}` : key;
  return `[missing: ${path}]`;
}

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !routing.locales.includes(locale as (typeof routing.locales)[number])) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: await loadMessages(locale),
    onError,
    getMessageFallback,
  };
});
