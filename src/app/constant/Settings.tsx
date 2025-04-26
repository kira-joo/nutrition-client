import FAQIcon from "@mui/icons-material/HelpOutline";
import InfoIcon from "@mui/icons-material/Info";
import { settingI } from "../interfaces/setting.interface";
import { AppRoute } from "./AppRoute";

export const settings: settingI[] = [
  {
    title: "About Us",
    url: AppRoute.About_Us,
    icon: <InfoIcon fontSize="small" />,
  },
  {
    title: "FAQ",
    url: AppRoute.Faq,
    icon: <FAQIcon fontSize="small" />,
  },
];
