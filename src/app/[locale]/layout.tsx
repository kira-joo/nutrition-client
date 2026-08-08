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
import { buildAlternates, buildOgImage, resolveSeo } from "@/lib/seo/metadata";
import { buildOrganizationJsonLd, JsonLd } from "@/lib/seo/json-ld";

import { Providers } from "../providers";
import "../globals.css";

// Single bilingual family for both locales — see docs/design-system.md
// ("Typography") for why one typeface covers both Arabic and Latin here
// instead of pairing two separate fonts.
const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-cairo",
  display: "swap",
});

/**
 * The site-wide fallback every route's own `generateMetadata` falls back
 * to when it has nothing more specific to say (§20 of the plan: no route
 * ever ships with an empty title/description). Pulled from real Site
 * Settings, not hardcoded copy — the previous static `metadata` export
 * here hardcoded "Dr.Omnia Ahmed" and a dead, expiring Facebook-CDN image
 * URL (`Images.Image1`) that had nothing to do with real CMS content.
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
export async function generateMetadata({ params }: { params: { locale: Locale } }): Promise<Metadata> {
  const siteSettings = await getSiteSettings(params.locale);
  const { title, description } = resolveSeo(siteSettings.defaultSeo, {
    title: "Dr. Omnia Ahmed — Clinical Nutrition",
    description: "Personalized clinical nutrition consultations and programs with Dr. Omnia Ahmed.",
  });

  return {
    metadataBase: siteMetadataBase,
    title: { default: title, template: `%s | ${title}` },
    description,
    alternates: buildAlternates("", params.locale),
    openGraph: {
      title,
      description,
      images: buildOgImage(siteSettings.ogImage),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: buildOgImage(siteSettings.ogImage)?.map((image) => image.url),
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
  params: { locale: Locale };
}

const FALLBACK_SITE_SETTINGS: LocalizedSiteSettings = {
  currencyCode: "EGP",
  socialLinks: [],
  logo: null,
  favicon: null,
  defaultSeo: { title: "", description: "" },
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
  const { locale } = params;

  if (!routing.locales.includes(locale)) {
    notFound();
  }

  const messages = await getMessages();
  const { siteSettings, doctorProfile, clinicName } = await getShellData(locale);
  const t = await getTranslations("layout");

  return (
    <html lang={locale} dir={locale === Locale.AR ? "rtl" : "ltr"} className={cairo.variable}>
      <body>
        {/* Site-wide MedicalBusiness identity — one Organization-family JSON-LD block for the whole site, never duplicated by a page-level override (see docs/architecture.md's SEO section). */}
        <JsonLd data={buildOrganizationJsonLd(siteSettings, clinicName)} />
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
            <SiteHeader logo={siteSettings.logo} clinicName={clinicName} whatsappNumber={siteSettings.whatsappNumber} phone={siteSettings.phone} />
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
