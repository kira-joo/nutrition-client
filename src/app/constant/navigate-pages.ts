import FastfoodIcon from "@mui/icons-material/Fastfood";
import HomeIcon from "@mui/icons-material/Home";
import InfoIcon from "@mui/icons-material/Info";
import MessageIcon from "@mui/icons-material/Message";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import { AppRoute } from "./AppRoute";

export const NavigatePages = [
  {
    title: "Home",
    description: "Welcome to the home page",
    url: AppRoute.Home,
    icon: <HomeIcon />,
  },
  {
    title: "About",
    description: "Learn more about us",
    url: AppRoute.About_Us,
    icon: <InfoIcon />,
  },
  {
    title: "Calories",
    description: "Nutrition Calculator",
    url: AppRoute.Calculator,
    icon: <FastfoodIcon />,
  },
  {
    title: "Recipes",
    description: "Find delicious recipes",
    url: AppRoute.Recipes,
    icon: <RestaurantMenuIcon />,
  },
  {
    title: "Send Message",
    url: AppRoute.Forms,
    icon: <MessageIcon fontSize="small" />,
  },
];
