import type { Metadata } from "next";
import type { ImageAsset, LocalizedResult } from "@kira-joo/toolkit-common";
import { Locale } from "@/constant/Locale.enum";
import { routing } from "@/i18n/routing";
import { SITE_ORIGIN } from "@/lib/config/site-origin.constant";

export interface SeoTitleDescription {
  title: string;
  description: string;
}

/**
 * A page-specific title/description (e.g. a recipe's own title, a
 * `Package.seoOverride`) wins when both fields are actually populated;
 * otherwise falls back to Site Settings' `defaultSeo` — per §20 of the
 * project's plan, no route may ever ship with an empty title/description,
 * and a half-populated override (title set, description blank) isn't
 * genuinely more specific than the site default, so it doesn't count as
 * an override.
 */
export function resolveSeo(override: Partial<SeoTitleDescription> | undefined, fallback: SeoTitleDescription): SeoTitleDescription {
  return {
    title: override?.title || fallback.title,
    description: override?.description || fallback.description,
  };
}

/**
 * Every locale variant of a page declares its own canonical (pointing at
 * itself, the standard hreflang pattern — never at one "master" locale)
 * plus cross-links to every other locale via `languages`, and an
 * `x-default` pointing at the routing default. `path` is locale-agnostic
 * and always starts with `/` (e.g. `/doctor`, `/recipes/[id]` already
 * substituted) — this function owns prefixing the locale segment, so call
 * sites never hand-assemble a `/ar/...`/`/en/...` string themselves.
 */
export function buildAlternates(path: string, currentLocale: Locale): Metadata["alternates"] {
  const languages: Record<string, string> = {};
  for (const locale of routing.locales) {
    languages[locale] = `${SITE_ORIGIN}/${locale}${path}`;
  }
  languages["x-default"] = `${SITE_ORIGIN}/${routing.defaultLocale}${path}`;

  return {
    canonical: `${SITE_ORIGIN}/${currentLocale}${path}`,
    languages,
  };
}

/**
 * Only ever built from a real `ImageAsset` — never a fabricated
 * placeholder. Returns `undefined` when there's no image, so callers spread
 * this into `openGraph.images` and Next simply omits the field rather than
 * rendering a broken image reference.
 */
export function buildOgImage(image: ImageAsset | LocalizedResult<ImageAsset> | null | undefined) {
  if (!image) return undefined;
  return [{ url: image.secureUrl, width: image.width, height: image.height }];
}
