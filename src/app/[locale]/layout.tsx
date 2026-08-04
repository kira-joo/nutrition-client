import { Box, Toolbar } from "@mui/material";
import { Metadata } from "next";
import { Cairo } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { Locale } from "../../constant/Locale.enum";
import { routing } from "@/i18n/routing";
import { Images } from "../components/constant/images";
import Footer from "../components/Footer/Footer";
import Navbar from "../components/header/Navbar";

import ThemeProvider from "@/utils/Provider/ThemeProvider";
import "../globals.css";
import "./global.css";

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
const LocaleLayout = async ({ children, params }: LocaleLayoutProps) => {
  const { locale } = params;

  if (!routing.locales.includes(locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} dir={locale === Locale.AR ? "rtl" : "ltr"} className={cairo.variable}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider locale={locale}>
            <Navbar />
            <Box
              display="flex"
              flexDirection="column"
              mb={5}
              minHeight="80vh"
              sx={{ pt: { xs: 5, md: 3 } }}
            >
              <Toolbar />
              {children}
            </Box>
            <Footer />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
};
export default LocaleLayout;
