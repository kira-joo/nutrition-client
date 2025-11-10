import AppRoute from "@/constant/AppRoute.enum";
import { ReactNode } from "react";

export interface settingI {
  title: keyof typeof import("../../i18n/locales/en/home.json");
  url: AppRoute;
  icon: ReactNode;
}
