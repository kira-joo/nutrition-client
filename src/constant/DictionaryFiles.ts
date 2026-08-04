// Resources/Reviews/Videos were removed — no locale JSON files ever backed
// them and no call site ever requested them (reviews/videos pages use the
// Home namespace instead); see docs/architecture.md ("Localization & RTL").
export enum DictionaryFiles {
  Home = "home",
  AboutUs = "about-us",
  SendMessage = "send-message",
  Recipes = "recipes",
  Faq = "faq",
  Calculator = "calculator",
  Packages = "packages",
  _15DayCamp = "15-day-camp",
}
