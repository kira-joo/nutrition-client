//src/types/i18n.d.ts
import { DictionaryFiles } from "@/constant/DictionaryFiles";

type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];

export type TranslationKeyMap = {
  [DictionaryFiles.Home]: NestedKeyOf<
    typeof import("../i18n/locales/en/home.json")
  >;
  [DictionaryFiles.AboutUs]: NestedKeyOf<
    typeof import("../i18n/locales/en/about-us.json")
  >;
};
