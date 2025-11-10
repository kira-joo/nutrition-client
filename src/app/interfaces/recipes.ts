import { DictionaryFiles } from "@/constant/DictionaryFiles";
import { TranslationKeyMap } from "@/types/i18n";

export interface Recipe {
  id: number;
  title: TranslationKeyMap[DictionaryFiles.Recipes];
  image: string;
  description: TranslationKeyMap[DictionaryFiles.Recipes];
  category: TranslationKeyMap[DictionaryFiles.Recipes];
  foodGroup: TranslationKeyMap[DictionaryFiles.Recipes][];
}
