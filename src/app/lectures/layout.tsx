import "@/lib/datetime/configure-timezone";
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { Locale } from "@/constant/Locale.enum";
import { siteMetadataBase } from "@/lib/config/site-origin.constant";
import { ContextMenuGuard } from "@/components/lectures/context-menu-guard";
import { Providers } from "../providers";
import { cairo } from "../fonts";
import "../globals.css";

/**
 * A second ROOT layout, deliberately outside `[locale]`.
 *
 * `[locale]/layout.tsx` renders `<html>` together with the site header and
 * footer, and a nested layout cannot opt out of its parent — so a lectures
 * route under `[locale]` would always inherit the site chrome. A sibling root
 * layout is Next's supported way to give one section a completely separate
 * shell without moving every existing page into a route group. The cost: a
 * navigation between this and the main site is a full page load, which is
 * fine for a page reached by direct link with no links out.
 *
 * Arabic-only, like Books: the locale is fixed here rather than read from a
 * URL segment, and `src/proxy.ts` lets `/lectures` bypass the locale
 * middleware so it is never redirected to `/ar/lectures`.
 *
 * `noindex`: the page sits behind a registration form and is shared by link,
 * not discovered through search.
 */
const LOCALE = Locale.AR;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations({ locale: LOCALE, namespace: "lectures" });
  const tSeo = await getTranslations({ locale: LOCALE, namespace: "seo" });
  return {
    metadataBase: siteMetadataBase,
    title: { default: t("metaTitle"), template: `%s | ${tSeo("title")}` },
    robots: { index: false, follow: false },
  };
}

export default async function LecturesRootLayout({ children }: { children: ReactNode }) {
  const messages = await getMessages({ locale: LOCALE });

  return (
    <html lang={LOCALE} dir="rtl" className={cairo.variable}>
      <body>
        <NextIntlClientProvider locale={LOCALE} messages={messages}>
          <Providers>
            <ContextMenuGuard />
            {children}
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
