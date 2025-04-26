import { AppRoute } from "@/app/constant/AppRoute";
import CalculateIcon from "@mui/icons-material/Calculate";
import FAQIcon from "@mui/icons-material/HelpOutline"; // Make sure to import the right icon for FAQ
import HomeIcon from "@mui/icons-material/Home";
import InfoIcon from "@mui/icons-material/Info";
import RecipeIcon from "@mui/icons-material/Restaurant"; // Make sure to import the right icon for Recipes
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";

export const FooterMenulist = [
  { icon: <HomeIcon fontSize="medium" />, label: "Home", href: AppRoute.Home },
  {
    icon: <CalculateIcon fontSize="medium" />,
    label: "Nutrition Calculator",
    href: AppRoute.Calculator,
  },
  // {
  //   icon: <RateReviewIcon fontSize="medium" />,
  //   label: "Reviews",
  //   href: AppRoute.Reviews,
  // },
  {
    icon: <VideoLibraryIcon fontSize="medium" />,
    label: "Videos",
    href: AppRoute.Videos,
  },
  {
    icon: <InfoIcon fontSize="medium" />,
    label: "About Us",
    href: AppRoute.About_Us,
  },
  {
    icon: <RecipeIcon fontSize="medium" />,
    label: "Recipes",
    href: AppRoute.Recipes,
  },
  {
    icon: <FAQIcon fontSize="medium" />,
    label: "FAQ",
    href: AppRoute.Faq,
  },
];
