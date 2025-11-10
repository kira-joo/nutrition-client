import { settingI } from "@/app/interfaces/setting.interface";
import FAQIcon from "@mui/icons-material/HelpOutline";
import InfoIcon from "@mui/icons-material/Info";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import AppRoute from "./AppRoute.enum";

export const settings: settingI[] = [
  {
    title: "about",
    url: AppRoute.About_Us,
    icon: <InfoIcon fontSize="small" />,
  },
  {
    title: "faq",
    url: AppRoute.Faq,
    icon: <FAQIcon fontSize="small" />,
  },
  {
    title: "consultation",
    url: AppRoute.Consultation,
    icon: <LocalHospitalIcon fontSize="small" />,
  },
];
