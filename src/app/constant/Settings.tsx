import InfoIcon from "@mui/icons-material/Info";
import FAQIcon from "@mui/icons-material/HelpOutline";
import { ReactNode } from "react";

interface SETTING {
  id: number;
  title: string;
  url: string;
  icon: ReactNode;
}

export const SETTINGS: SETTING[] = [
  {
    id: 1,
    title: "About Us",
    url: "/about_us",
    icon: <InfoIcon fontSize="small" />,
  },
  {
    id: 2,
    title: "FAQ",
    url: "/faq",
    icon: <FAQIcon fontSize="small" />,
  },
];
