import { ReactNode } from "react";

export interface settingI {
  title: keyof typeof import("../../i18n/locales/en/home.json");
  url: string;
  icon: ReactNode;
}
