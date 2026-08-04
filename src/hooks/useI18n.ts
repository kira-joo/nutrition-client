"use client";
import { useTranslations } from "next-intl";

/**
 * Thin wrapper kept only so the ~25 existing call sites
 * (`const { t } = useI18n(DictionaryFiles.X)`) don't need touching in this
 * phase — the real work is `useTranslations` from next-intl, typed
 * automatically via the global `IntlMessages` augmentation in
 * src/types/next-intl.d.ts instead of the old bespoke TranslationKeyMap.
 */
const useI18n = <TNamespace extends keyof IntlMessages>(namespace: TNamespace) => {
  const t = useTranslations(namespace);
  return { t };
};

export default useI18n;
