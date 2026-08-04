import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

/**
 * Locale-aware navigation primitives built on `routing`. `usePathname()`
 * here returns the pathname WITHOUT the locale prefix, and `useRouter()`'s
 * `push`/`replace` take a `{ locale }` option that adds the right prefix —
 * this is what `LanguageSwitch` uses so switching locale is one call
 * instead of manual pathname splicing.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
