export default interface navigatePagesI {
  title: keyof typeof import("../../i18n/locales/en/home.json");
  description: keyof typeof import("../../i18n/locales/en/home.json");
  url: string;
  icon: JSX.Element;
}
