// Global type augmentation for next-intl — this is what replaces the old
// bespoke TranslationKeyMap/NestedKeyOf system (src/types/i18n.d.ts,
// deleted). Declaring `IntlMessages` here makes every `useTranslations()`/
// `getTranslations()` call across the app type-check its `namespace` and
// `key` arguments automatically, with no per-call generic needed.
//
// Typed from the English JSON files specifically (matching the old
// system's own convention) — see docs/architecture.md ("Localization &
// RTL") for why English, not Arabic, is the typing source of truth.

type HomeMessages = typeof import("@/i18n/locales/en/home.json");
type SendMessageMessages = typeof import("@/i18n/locales/en/send-message.json");
type RecipesMessages = typeof import("@/i18n/locales/en/recipes.json");
type CalculatorMessages = typeof import("@/i18n/locales/en/calculator.json");
type PackagesMessages = typeof import("@/i18n/locales/en/packages.json");
type FaqMessages = typeof import("@/i18n/locales/en/faq.json");
type FifteenDayCampMessages = typeof import("@/i18n/locales/en/15-day-camp.json");
type LayoutMessages = typeof import("@/i18n/locales/en/layout.json");

interface Messages {
  home: HomeMessages;
  "send-message": SendMessageMessages;
  recipes: RecipesMessages;
  calculator: CalculatorMessages;
  packages: PackagesMessages;
  faq: FaqMessages;
  "15-day-camp": FifteenDayCampMessages;
  layout: LayoutMessages;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- next-intl's documented augmentation pattern
declare interface IntlMessages extends Messages {}
