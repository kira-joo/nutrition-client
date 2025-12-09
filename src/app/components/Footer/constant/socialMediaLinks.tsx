import EmailIcon from "@mui/icons-material/Email";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import { WhatsappNumber } from "../../constant/numbers";

export const SocialMediaLinks = [
  {
    icon: <InstagramIcon fontSize="large" />,
    color: "#E1306C",
    href: "https://www.instagram.com/dr.omnia.ahmed/",
    name: "Instagram",
  },
  {
    icon: <FacebookIcon fontSize="large" />,
    color: "#1877F2",
    href: "https://www.facebook.com/profile.php?id=100078890377662",
    name: "Facebook",
  },
  {
    icon: <EmailIcon fontSize="large" />,
    color: "#D44638",
    href: "mailto:omniaalnagy@gmail.com",
    name: "Email",
  },
  {
    icon: <WhatsAppIcon fontSize="large" />,
    color: "green",
    href: `https://wa.me/${WhatsappNumber}`,
    name: "WhatsApp",
  },
  {
    icon: <LinkedInIcon fontSize="large" />,
    color: "#0077B5",
    href: "https://www.linkedin.com/in/dr-omnia-ahmed-757a00328?",
    name: "LinkedIn",
  },
];
