//src/i18n/index.ts
import { DictionaryFiles } from "@/constant/DictionaryFiles";
import { Locale } from "@/constant/Locale.enum";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next).init({
  resources: {
    en: {
      [DictionaryFiles.Home]: require("./locales/en/home.json"),
      [DictionaryFiles.AboutUs]: require("./locales/en/about-us.json"),
      [DictionaryFiles.SendMessage]: require("./locales/en/send-message.json"),
      [DictionaryFiles.Recipes]: require("./locales/en/recipes.json"),
      [DictionaryFiles.Calculator]: require("./locales/en/calculator.json"),
      [DictionaryFiles.Packages]: require("./locales/en/packages.json"),
      [DictionaryFiles.Faq]: require("./locales/en/faq.json"),
    },
    ar: {
      [DictionaryFiles.Home]: require("./locales/ar/home.json"),
      [DictionaryFiles.AboutUs]: require("./locales/ar/about-us.json"),
      [DictionaryFiles.SendMessage]: require("./locales/ar/send-message.json"),
      [DictionaryFiles.Recipes]: require("./locales/ar/recipes.json"),
      [DictionaryFiles.Calculator]: require("./locales/ar/calculator.json"),
      [DictionaryFiles.Packages]: require("./locales/ar/packages.json"),
      [DictionaryFiles.Faq]: require("./locales/ar/faq.json"),
    },
  },
  lng: Locale.AR,
  fallbackLng: Locale.AR,
  interpolation: { escapeValue: false },
});

export default i18n;
