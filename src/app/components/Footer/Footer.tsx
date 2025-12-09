"use client";
import { DictionaryFiles } from "@/constant/DictionaryFiles";
import { Locale } from "@/constant/Locale.enum";
import useI18n from "@/hooks/useI18n";
import { Box, Grid, IconButton, Tooltip, Typography } from "@mui/material";
import Image from "next/image";
import { useParams, usePathname } from "next/navigation";
import AppLinkMUI from "../AppLink/AppLinkMUI";
import { FooterMenulist } from "./constant/FooterMenulist";
import { SocialMediaLinks } from "./constant/socialMediaLinks";

const footerStyles = {
  container: {
    background: "#4db6b2",
    borderRadius: 4,
    p: { xs: 3, md: 4 },
    boxShadow: 3,
    textAlign: "center",
    borderTop: "1px solid #ddd",
    mt: "auto",
  },
  logoContainer: { mb: 1, display: { xs: "none", md: "block" } },
  logoSection: { textAlign: { xs: "center", md: "start" } },
  description: { color: "#ffffff", fontWeight: 500 },
  socialSection: {
    mt: { md: 3, xs: 2 },
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
  },
  socialTitle: { color: "#ffffff", mb: 1, fontWeight: 600 },
  socialContainer: {
    display: "flex",
    justifyContent: "center",
    gap: 2,
  },
  menuSection: { textAlign: "center", display: { xs: "none", md: "block" } },
  menuHeader: { marginBottom: "20px" },
  menuTitle: { color: "#04715d" },
  menuUnderline: {
    width: "40%",
    height: "4px",
    backgroundColor: "#04715d",
    margin: "0 auto",
    borderRadius: "2px",
  },
  menuContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
  },
  menuLink: {
    textDecoration: "none",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    mb: 0.5,
    gap: 2,
    transition: "all 0.3s ease",
    padding: "4px 8px",
    borderRadius: "4px",
    "&:hover": {
      backgroundColor: "#00796b",
      transform: "scale(1.02)",
      boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.2)",
    },
  },
  footerProfile: {
    color: "#ffffff",
    textAlign: "center",
    mt: { xs: 3, md: 0 },
  },
} as const;

const Footer = () => {
  const { t } = useI18n(DictionaryFiles.Home);
  const { locale }: { locale: Locale } = useParams();
  const pathname = usePathname();
  const isLandingPage = pathname?.includes("/15-day-camp");

  return (
    <Box
      component="footer"
      sx={{
        ...footerStyles.container,
        ...(isLandingPage && { mb: { xs: 10, md: 12 } }), // Add margin only on landing page
      }}
    >
      <Grid
        container
        spacing={{
          xs: locale === Locale.EN ? 5 : 0,
          md: locale === Locale.EN ? 10 : 5,
        }}
      >
        <Grid item xs={12} md={4} sx={footerStyles.logoSection}>
          <Box sx={footerStyles.logoContainer}>
            <Image
              src="/images/leftLogo.png"
              alt={t("logoAlt")}
              width={290}
              height={120}
            />
          </Box>
          <Typography variant="subtitle1" sx={footerStyles.description}>
            {t("description")}
          </Typography>
        </Grid>

        <Grid item xs={12} md={4} sx={footerStyles.socialSection}>
          <Typography variant="subtitle1" sx={footerStyles.socialTitle}>
            {t("connectWithMe")}
          </Typography>
          <Box sx={footerStyles.socialContainer}>
            {SocialMediaLinks.map(({ icon, color, href, name }, index) => (
              <Tooltip title={name} key={index}>
                <IconButton
                  component="a"
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ color }}
                  aria-label={name}
                >
                  {icon}
                </IconButton>
              </Tooltip>
            ))}
          </Box>
        </Grid>

        <Grid item xs={12} md={4} sx={footerStyles.menuSection}>
          <Box sx={footerStyles.menuHeader}>
            <Typography variant="h5" sx={footerStyles.menuTitle}>
              {t("menu")}
            </Typography>
            <Box sx={footerStyles.menuUnderline} />
          </Box>
          <Box sx={footerStyles.menuContainer}>
            {FooterMenulist.map(({ icon, label, href }, index) => (
              <AppLinkMUI key={index} href={href} sx={footerStyles.menuLink}>
                {icon} {t(label as keyof typeof t)}
              </AppLinkMUI>
            ))}
          </Box>
        </Grid>
      </Grid>

      <Typography variant="body2" sx={footerStyles.footerProfile}>
        {t("footerProfile")}
      </Typography>
    </Box>
  );
};

export default Footer;
