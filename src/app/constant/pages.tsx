import HomeIcon from "@mui/icons-material/Home";
import InfoIcon from "@mui/icons-material/Info";
import FastfoodIcon from "@mui/icons-material/Fastfood";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import MessageIcon from "@mui/icons-material/Message";

export const PAGES = [
  {
    id: 1,
    title: "Home",
    description: "Welcome to the home page",
    url: "/",
    icon: <HomeIcon />, // Home icon
  },
  {
    id: 2,
    title: "About",
    description: "Learn more about us",
    url: "/about_us",
    icon: <InfoIcon />, // Information icon
  },
  {
    id: 3,
    title: "Calories",
    description: "Nutrition Calculator",
    url: "/Nutrition-Calculator",
    icon: <FastfoodIcon />, // Food-related icon
  },
  {
    id: 4,
    title: "Recipes",
    description: "Find delicious recipes",
    url: "/recipes",
    icon: <RestaurantMenuIcon />, // Menu/recipe icon
  },
  {
    id: 5,
    title: "Send Message",
    url: "/forms",
    icon: <MessageIcon fontSize="small" />,
  },
];
