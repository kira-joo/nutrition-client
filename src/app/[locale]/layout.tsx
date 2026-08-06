import { Metadata } from "next";
import { Cairo } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { resolveLocalized } from "@kira-joo/toolkit-common";
import { Locale } from "../../constant/Locale.enum";
import { routing } from "@/i18n/routing";
import { getDoctorProfile, getSiteSettings } from "@/lib/data";
import type { SiteSettings } from "@/lib/domain/site-settings";
import { SiteHeader } from "@/components/layout/site-header/site-header";
import { SiteFooter } from "@/components/layout/site-footer/site-footer";
import { Images } from "../components/constant/images";

import { Providers } from "../providers";
// TODO(tech-debt): ThemeProvider (MUI) stays wrapping `children` only —
// never the new SiteHeader/SiteFooter above — purely so the pages that
// haven't been individually rebuilt yet (everything except this shell)
// don't lose MUI theme context mid-phase. Remove this import and the
// remaining `@mui/material`/`@emotion/*` dependencies entirely once every
// page under `[locale]/**` has been rebuilt in Tailwind (the final
// cleanup sweep — see docs/HANDOFF.md §4, Phase 10).
import ThemeProvider from "@/utils/Provider/ThemeProvider";
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

export const metadata: Metadata = {
  title: "Dr.Omnia Ahmed",
  description: "A brief description of your website.",

  openGraph: {
    title: "Dr.Omnia Ahmed",
    description: "د/ أمنية أحمد أخصائية تغذية علاجية وسمنة ونحافة",
    images: [
      {
        url: Images.Image1,
        alt: "د/ أمنية أحمد أخصائية تغذية علاجية وسمنة ونحافة",
      },
    ],
    url: "./favicon.ico",
  },
  icons: "./favicon.ico",
};
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

const FALLBACK_SITE_SETTINGS: SiteSettings = {
  currencyCode: "EGP",
  socialLinks: [],
  logo: null,
  favicon: null,
  defaultSeo: { title: { ar: "", en: "" }, description: { ar: "", en: "" } },
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
    const [siteSettings, doctorProfile] = await Promise.all([getSiteSettings(), getDoctorProfile()]);
    return { siteSettings, clinicName: resolveLocalized(doctorProfile.name, locale) || "Dr. Omnia" };
  } catch {
    return { siteSettings: FALLBACK_SITE_SETTINGS, clinicName: "Dr. Omnia" };
  }
}

const LocaleLayout = async ({ children, params }: LocaleLayoutProps) => {
  const { locale } = params;

  if (!routing.locales.includes(locale)) {
    notFound();
  }

  const messages = await getMessages();
  const { siteSettings, clinicName } = await getShellData(locale);

  return (
    <html lang={locale} dir={locale === Locale.AR ? "rtl" : "ltr"} className={cairo.variable}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <SiteHeader logo={siteSettings.logo} clinicName={clinicName} whatsappNumber={siteSettings.whatsappNumber} phone={siteSettings.phone} />
            <ThemeProvider locale={locale}>
              <main className="flex min-h-[80vh] flex-col pt-16 lg:pt-20">{children}</main>
            </ThemeProvider>
            <SiteFooter siteSettings={siteSettings} clinicName={clinicName} />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
};
export default LocaleLayout;
