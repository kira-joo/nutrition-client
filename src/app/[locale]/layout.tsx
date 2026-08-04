import { Box, Toolbar } from "@mui/material";
import { Metadata } from "next";
import { Cairo } from "next/font/google";
import type { ReactNode } from "react";
import { Locale } from "../../constant/Locale.enum";
import { Images } from "../components/constant/images";
import Footer from "../components/Footer/Footer";
import Navbar from "../components/header/Navbar";

import LanguageProvider from "@/utils/Provider/LanguageProvider";
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
interface LocaleLayoutProps {
  children: ReactNode;
  params: { locale: Locale };
}
const LocaleLayout = ({ children, params }: LocaleLayoutProps) => {
  const { locale } = params;

  return (
    <html lang={locale} dir={locale === Locale.AR ? "rtl" : "ltr"} className={cairo.variable}>
      <body>
        <LanguageProvider locale={locale}>
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
        </LanguageProvider>
      </body>
    </html>
  );
};
export default LocaleLayout;
