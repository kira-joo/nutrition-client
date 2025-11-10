import navigatePagesI from "@/app/interfaces/navigate-pages.interface";
import { Subscriptions } from "@mui/icons-material";
import FastfoodIcon from "@mui/icons-material/Fastfood";
import HomeIcon from "@mui/icons-material/Home";
import InfoIcon from "@mui/icons-material/Info";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import MessageIcon from "@mui/icons-material/Message";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import AppRoute from "./AppRoute.enum";

export const NavigatePages: navigatePagesI[] = [
  {
    title: "home",
    description: "description-Home",
    url: AppRoute.Home,
    icon: <HomeIcon />,
  },
  {
    title: "about",
    description: "description-About",
    url: AppRoute.About_Us,
    icon: <InfoIcon />,
  },
  {
    title: "calories",
    description: "description-Calories",
    url: AppRoute.Calculator,
    icon: <FastfoodIcon />,
  },
  {
    title: "recipes",
    description: "description-Recipes",
    url: AppRoute.Recipes,
    icon: <RestaurantMenuIcon />,
  },
  {
    title: "sendMessage",
    description: "description-SendMessage",
    url: AppRoute.SendMessage,
    icon: <MessageIcon fontSize="small" />,
  },
  {
    title: "consultation",
    description: "consultation",
    url: AppRoute.Consultation,
    icon: <LocalHospitalIcon />,
  },
  {
    title: "packages",
    description: "packages",
    url: AppRoute.Packages,
    icon: <Subscriptions />,
  },
];
