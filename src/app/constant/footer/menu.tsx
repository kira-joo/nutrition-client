import HomeIcon from "@mui/icons-material/Home";
import CalculateIcon from "@mui/icons-material/Calculate";
import RateReviewIcon from "@mui/icons-material/RateReview";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import InfoIcon from "@mui/icons-material/Info";
import RecipeIcon from "@mui/icons-material/Restaurant"; // Make sure to import the right icon for Recipes
import FAQIcon from "@mui/icons-material/HelpOutline"; // Make sure to import the right icon for FAQ

export const MENULINKS = [
  { icon: <HomeIcon fontSize="medium" />, label: "Home", href: "/" },
  {
    icon: <CalculateIcon fontSize="medium" />,
    label: "Nutrition Calculator",
    href: "/Nutrition-Calculator",
  },
  {
    icon: <RateReviewIcon fontSize="medium" />,
    label: "Reviews",
    href: "/reviews",
  },
  {
    icon: <VideoLibraryIcon fontSize="medium" />,
    label: "Videos",
    href: "/videos",
  },
  {
    icon: <InfoIcon fontSize="medium" />,
    label: "About Us",
    href: "/about_us",
  },
  {
    icon: <RecipeIcon fontSize="medium" />,
    label: "Recipes",
    href: "/recipes",
  },
  {
    icon: <FAQIcon fontSize="medium" />,
    label: "FAQ",
    href: "/faq",
  },
];
