import { defineRouting } from "next-intl/routing";
import { Locale } from "@/constant/Locale.enum";

/**
 * The one place the app's supported locales and default locale are
 * declared. Everything else (middleware, request config, the navigation
 * helpers in `navigation.ts`) reads from this — see docs/architecture.md
 * ("Localization & RTL") for the full picture.
 *
 * `localeDetection: false` preserves the current product behavior: `/`
 * always resolves to the default locale (Arabic) rather than negotiating
 * against the visitor's Accept-Language header. This is a deliberate
 * carry-over, not an oversight — enabling browser-language negotiation is
 * a product decision for a later phase, not part of this infrastructure
 * swap.
 */
export const routing = defineRouting({
  locales: [Locale.AR, Locale.EN],
  defaultLocale: Locale.AR,
  localeDetection: false,
});
