import "@/lib/datetime/configure-timezone";
import { Metadata } from "next";
import { Cairo } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { Locale } from "../../constant/Locale.enum";
import { routing } from "@/i18n/routing";
import { getDoctorProfile, getSiteSettings } from "@/lib/data";
import type { LocalizedSiteSettings } from "@/lib/domain/site-settings";
import { SiteHeader } from "@/components/layout/site-header/site-header";
import { SiteFooter } from "@/components/layout/site-footer/site-footer";
import { siteMetadataBase } from "@/lib/config/site-origin.constant";
import { buildAlternates } from "@/lib/seo/metadata";
import { buildOrganizationJsonLd, JsonLd } from "@/lib/seo/json-ld";

import { Providers } from "../providers";
import "../globals.css";

// Single bilingual family for both locales — see docs/design-system.md
// ("Typography") for why one typeface covers both Arabic and Latin here
// instead of pairing two separate fonts.
const cairo = Cairo({
  subsets: ["arabic", "latin"],
  // 900 added for the homepage redesign's display moments (hero, section
  // headings) — the existing family stays the single bilingual typeface
  // (see docs/design-system.md "Typography" for why this app deliberately
  // doesn't pair a second display face); this only extends its own range.
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-cairo",
  display: "swap",
});

/**
 * Site-wide metadata — title, description, OG/Twitter — is now static,
 * client-owned, and localized via the `seo` next-intl namespace, not
 * fetched from Site Settings. It previously read `siteSettings.defaultSeo`
 * and `siteSettings.ogImage`, which made permanent site identity (the
 * title every page falls back to, the image every social share uses)
 * depend on a live nutrition-staff request and on a CMS field an editor
 * could accidentally clear. Real *content* still comes from the CMS
 * (recipe/book/package data, the doctor's own name and tagline elsewhere
 * in this file) — this is specifically the fixed brand-identity layer,
 * which belongs with the app the same way UI copy does (see this repo's
 * `next-intl` vs `resolveLocalized` convention in `docs/architecture.md`).
 *
 * The OG/Twitter image is the client-local brand mark (`/images/logo.png`,
 * the same asset the header/footer now use) rather than a fetched
 * `ImageAsset` — no dedicated social-card asset exists yet, and a fixed
 * local path needs no `buildOgImage` (that helper stays for CMS-owned
 * per-route images, e.g. a book's own cover in `books/[slug]/page.tsx`).
 * `metadataBase` resolves it against the real origin.
 *
 * `icons` is deliberately absent: `src/app/favicon.ico` already exists as
 * a real file, and Next's file-based favicon convention picks it up
 * automatically — an explicit `icons: "./favicon.ico"` here was actually
 * the root cause of a real bug (a relative URL with no `metadataBase` set
 * resolves against the *current request path*, so `/ar/doctor` requested
 * `/ar/favicon.ico` and 404'd). `metadataBase` below fixes relative URLs
 * generally (OG images, canonical/alternates), but the correct fix for
 * the favicon specifically is to stop declaring it at all.
 */
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const t = await getTranslations({ locale, namespace: "seo" });
  const title = t("title");
  const description = t("description");
  const ogImage = { url: "/images/logo.png", width: 1536, height: 1024 };

  return {
    metadataBase: siteMetadataBase,
    title: { default: title, template: `%s | ${title}` },
    description,
    alternates: buildAlternates("", locale),
    openGraph: {
      title,
      description,
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage.url],
    },
  };
}
// Deliberately NOT adding generateStaticParams/setRequestLocale here: every
// route today (before and after this phase) renders fully dynamically —
// nothing in the app is statically generated yet. Adding static params for
// the locale segment would make Next try to prerender every page under it,
// which surfaces "useSearchParams() needs a Suspense boundary" failures in
// components like LanguageSwitch that were never designed around static
// generation. Static rendering is a real performance opportunity, but it's
// a Phase 5/7 (caching/perf) concern once real Suspense boundaries exist
// where they're needed — not something to force through as a side effect
// of this i18n-engine swap.
interface LocaleLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

const FALLBACK_SITE_SETTINGS: LocalizedSiteSettings = {
  currencyCode: "EGP",
  socialLinks: [],
};

/**
 * The global shell's own CMS reads (site settings for the header/footer,
 * doctor profile for the clinic name shown when no logo is set) are
 * wrapped defensively — a nutrition-staff hiccup here would otherwise take
 * down every single page's chrome, not just one section of one page. Falls
 * back to a blank-but-functional shell (no logo/social links, a plain
 * "Dr. Omnia" name) rather than throwing and invoking the global
 * error boundary for the whole site.
 */
async function getShellData(locale: Locale) {
  try {
    const [siteSettings, doctorProfile] = await Promise.all([getSiteSettings(locale), getDoctorProfile(locale)]);
    return { siteSettings, doctorProfile, clinicName: doctorProfile.name || "Dr. Omnia" };
  } catch {
    return { siteSettings: FALLBACK_SITE_SETTINGS, doctorProfile: null, clinicName: "Dr. Omnia" };
  }
}

const LocaleLayout = async ({ children, params }: LocaleLayoutProps) => {
  const { locale: rawLocale } = await params;

  if (!routing.locales.includes(rawLocale as Locale)) {
    notFound();
  }

  const locale = rawLocale as Locale;

  const messages = await getMessages();
  const { siteSettings, doctorProfile, clinicName } = await getShellData(locale);
  const t = await getTranslations("layout");
  const tSeo = await getTranslations({ locale, namespace: "seo" });

  return (
    <html lang={locale} dir={locale === Locale.AR ? "rtl" : "ltr"} className={cairo.variable}>
      <body>
        {/* Site-wide MedicalBusiness identity — one Organization-family JSON-LD block for the whole site, never duplicated by a page-level override (see docs/architecture.md's SEO section). */}
        <JsonLd
          data={buildOrganizationJsonLd(siteSettings, clinicName, {
            description: tSeo("description"),
            logoPath: "/images/logo.png",
          })}
        />
        {/*
          First focusable element in the DOM, before the header's own nav —
          invisible until it receives keyboard focus (`sr-only`/`focus:not-sr-only`),
          at which point it lets a keyboard/screen-reader user jump straight past
          the header's ~10 nav stops into `<main>`. There was no such link anywhere
          in the app before this; every page forced a full traversal of the header
          on every single load.
        */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-tooltip focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-white"
        >
          {t("nav.skipToContent")}
        </a>
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <SiteHeader
              clinicName={clinicName}
              whatsappNumber={siteSettings.whatsappNumber}
              phone={siteSettings.phone}
            />
            <main id="main-content" className="flex min-h-[80vh] flex-col pt-16 lg:pt-20">
              {children}
            </main>
            <SiteFooter siteSettings={siteSettings} clinicName={clinicName} doctorTagline={doctorProfile?.tagline} />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
};
export default LocaleLayout;
