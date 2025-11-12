"use client";
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

  return (
    <>
      <Box sx={{ background: "#6ce6d0", py: 5 }}>
        <Box
          sx={{
            background: "#6ce6d0",
            py: 5,
          }}
        >
          <Container maxWidth="md">
            {/* Header */}
            <Box textAlign="center" mb={4}>
              <Avatar
                alt={t("avatarAlt")}
                src="../favicon.ico"
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
              }}
            >
              <CardContent>
                <Typography
                  variant="h6"
                  component="h2"
                  color="primary"
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
                  color="primary"
                  sx={{ mt: 4, mb: 2, fontWeight: "bold", color: "#f27a8c" }}
                >
                  {t("programHeader")}
                </Typography>
                <ul>
                  <li>
                    <Typography variant="body1">
                      {t("program.benefit1")}
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body1">
                      {t("program.benefit2")}
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body1">
                      {t("program.benefit3")}
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body1">
                      {t("program.benefit4")}
                    </Typography>
                  </li>
                </ul>

                <Typography
                  variant="h6"
                  component="h2"
                  color="primary"
                  sx={{ mt: 4, mb: 2, fontWeight: "bold", color: "#f27a8c" }}
                >
                  {t("whyChooseMe")}
                </Typography>
                <ul>
                  <li>
                    <Typography variant="body1">
                      {t("reasons.reason1")}
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body1">
                      {t("reasons.reason2")}
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body1">
                      {t("reasons.reason3")}
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body1">
                      {t("reasons.reason4")}
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body1">
                      {t("reasons.reason5")}
                    </Typography>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </Container>
        </Box>

        {/* Contact Section */}
        <Box>
          <Container maxWidth="md">
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
                  href="tel:01155924248"
                >
                  {t("contact.phone")} 01155924248
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
      </Box>
    </>
  );
};

export default AboutUs;
