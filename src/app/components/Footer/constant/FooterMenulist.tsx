import AppRoute from "@/constant/AppRoute.enum";
import CalculateIcon from "@mui/icons-material/Calculate";
import FAQIcon from "@mui/icons-material/HelpOutline"; // Make sure to import the right icon for FAQ
import HomeIcon from "@mui/icons-material/Home";
import InfoIcon from "@mui/icons-material/Info";
import RecipeIcon from "@mui/icons-material/Restaurant"; // Make sure to import the right icon for Recipes
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";

export const FooterMenulist = [
  { icon: <HomeIcon fontSize="medium" />, label: "home", href: AppRoute.Home },
  {
    icon: <CalculateIcon fontSize="medium" />,
    label: "calories",
    href: AppRoute.Calculator,
  },
  // {
  //   icon: <RateReviewIcon fontSize="medium" />,
  //   label: "Reviews",
  //   href: AppRoute.Reviews,
  // },
  {
    icon: <VideoLibraryIcon fontSize="medium" />,
    label: "video",
    href: AppRoute.Videos,
  },
  {
    icon: <InfoIcon fontSize="medium" />,
    label: "about",
    href: AppRoute.About_Us,
  },
  {
    icon: <RecipeIcon fontSize="medium" />,
    label: "recipes",
    href: AppRoute.Recipes,
  },
  {
    icon: <FAQIcon fontSize="medium" />,
    label: "faq",
    href: AppRoute.Faq,
  },
];
