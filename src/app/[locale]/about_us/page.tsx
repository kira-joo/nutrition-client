"use client";
import { PhoneNumber } from "@/app/components/constant/numbers";
import ImageDialog from "@/app/components/ImageDialog";
import { DictionaryFiles } from "@/constant/DictionaryFiles";
import useI18n from "@/hooks/useI18n";
import LocalPhoneIcon from "@mui/icons-material/LocalPhone";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Typography,
} from "@mui/material";

const AboutUs = () => {
  const { t } = useI18n(DictionaryFiles.AboutUs);

  const magazineImages = [
    { src: "/magazine/magazine1.jpeg", alt: "Dr. Omnia in magazine 1" },
    { src: "/magazine/magazine2.jpeg", alt: "Dr. Omnia in magazine 2" },
    { src: "/magazine/magazine3.jpeg", alt: "Dr. Omnia in magazine 3" },
    { src: "/magazine/magazine4.jpeg", alt: "Dr. Omnia in magazine 4" },
    { src: "/magazine/magazine5.jpeg", alt: "Dr. Omnia in magazine 5" },
  ];

  return (
    <>
      <Box sx={{ background: "#6ce6d0", py: 5 }}>
        <Container maxWidth="md">
          {/* Header */}
          <Box textAlign="center" mb={4}>
            <Avatar
              alt={t("avatarAlt")}
              src="/favicon.ico"
              sx={{ width: 120, height: 120, mx: "auto" }}
            />
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: "bold",
                letterSpacing: "0.1rem",
                mt: 2,
                color: "#f27a8c",
              }}
            >
              {t("welcome")}
            </Typography>
            <Typography variant="subtitle1" color="#000000" gutterBottom>
              {t("subtitle")}
            </Typography>
          </Box>

          {/* Main Content */}
          <Card
            sx={{
              p: 3,
              backgroundColor: "#cff7f0",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              mb: 5,
            }}
          >
            <CardContent>
              <Typography
                variant="h6"
                component="h2"
                sx={{ mb: 2, fontWeight: "bold", color: "#f27a8c" }}
              >
                {t("feelTired")}
              </Typography>
              <Typography variant="body1" paragraph>
                {t("description1")}
              </Typography>
              <Typography variant="body1" paragraph>
                {t("description2")}
              </Typography>

              <Typography
                variant="h6"
                component="h2"
                sx={{ mt: 4, mb: 2, fontWeight: "bold", color: "#f27a8c" }}
              >
                {t("programHeader")}
              </Typography>
              <ul>
                <li>
                  <Typography>{t("program.benefit1")}</Typography>
                </li>
                <li>
                  <Typography>{t("program.benefit2")}</Typography>
                </li>
                <li>
                  <Typography>{t("program.benefit3")}</Typography>
                </li>
                <li>
                  <Typography>{t("program.benefit4")}</Typography>
                </li>
              </ul>

              <Typography
                variant="h6"
                component="h2"
                sx={{ mt: 4, mb: 2, fontWeight: "bold", color: "#f27a8c" }}
              >
                {t("whyChooseMe")}
              </Typography>
              <ul>
                <li>
                  <Typography>{t("reasons.reason1")}</Typography>
                </li>
                <li>
                  <Typography>{t("reasons.reason2")}</Typography>
                </li>
                <li>
                  <Typography>{t("reasons.reason3")}</Typography>
                </li>
                <li>
                  <Typography>{t("reasons.reason4")}</Typography>
                </li>
                <li>
                  <Typography>{t("reasons.reason5")}</Typography>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Magazine Section */}
          <Box textAlign="center" mb={5}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: "bold",
                color: "#f27a8c",
                mb: 3,
              }}
            >
              {t("featuredIn")}
            </Typography>
            <Grid container spacing={2} justifyContent="center">
              {magazineImages.map((image, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Box
                    sx={{
                      borderRadius: 3,
                      overflow: "hidden",
                      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    <ImageDialog
                      src={image.src}
                      alt={image.alt}
                      width={400}
                      height={300}
                    />
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Contact Section */}
          <Grid container spacing={2} justifyContent="center">
            <Grid item>
              <Button
                variant="contained"
                sx={{
                  background: "#ff6f61",
                  color: "#fff",
                  "&:hover": {
                    background: "#e65c53",
                  },
                }}
                startIcon={<LocalPhoneIcon />}
                href={`tel:${PhoneNumber}`}
              >
                {t("contact.phone")} {PhoneNumber}
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                sx={{
                  background: "#4381c1",
                  color: "#fff",
                  "&:hover": { background: "#2ed8c0" },
                }}
                startIcon={<MailOutlineIcon />}
                href="mailto:omniaalnagy@gmail.com"
              >
                {t("contact.email")}
              </Button>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
};

export default AboutUs;
