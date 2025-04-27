"use client";

import { Locale } from "@/constant/Locale.enum";
import i18n from "@/i18n";
import { useEffect } from "react";

interface LanguageProviderProps {
  children: React.ReactNode;
  locale: Locale;
}

export default function LanguageProvider({
  children,
  locale,
}: LanguageProviderProps) {
  useEffect(() => {
    if (locale) {
      i18n.changeLanguage(locale);
      document.documentElement.dir = locale === Locale.AR ? "rtl" : "ltr";
    }
  }, [locale]);

  return children;
}
