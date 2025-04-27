//src/i18n/index.ts
import { DictionaryFiles } from "@/constant/DictionaryFiles";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next).init({
  resources: {
    en: {
      [DictionaryFiles.Home]: require("./locales/en/home.json"),
      [DictionaryFiles.AboutUs]: require("./locales/en/about-us.json"),
    },
    ar: {
      [DictionaryFiles.Home]: require("./locales/ar/home.json"),
      [DictionaryFiles.AboutUs]: require("./locales/ar/about-us.json"),
    },
  },
  lng: "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
