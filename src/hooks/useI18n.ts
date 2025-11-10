// src/hooks/useI18n.ts
import { TranslationKeyMap } from "@/types/i18n";
import { useTranslation as useTranslationBase } from "react-i18next";

const useI18n = <TNamespace extends keyof TranslationKeyMap>(
  namespace: TNamespace
) => {
  const translation = useTranslationBase(namespace);

  return {
    ...translation,
    t: translation.t as (
      key: TranslationKeyMap[TNamespace],
      options?: any
    ) => string,
  };
};

export default useI18n;
