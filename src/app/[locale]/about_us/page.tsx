"use client";
import * as React from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Avatar,
} from "@mui/material";
import LocalPhoneIcon from "@mui/icons-material/LocalPhone";
import MailOutlineIcon from "@mui/icons-material/MailOutline";

export default function AboutUs() {
  return (
    <>
      <Box
        sx={{
          background: "#6ce6d0",
          py: 5,
        }}
      >
        <Box
          sx={{
            background: "#6ce6d0", // Softer tones#e3f4f1
            py: 5,
            direction: "rtl",
            textAlign: "right",
          }}
        >
          <Container maxWidth="md">
            {/* Header */}
            <Box textAlign="center" mb={4}>
              <Avatar
                alt="Dr.Omnia Ahmed"
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
                مرحبا بكم!
              </Typography>
              <Typography variant="subtitle1" color="#000000" gutterBottom>
                د. أمنية أحمد - أخصائية التغذية العلاجية والسمنة والنحافة
              </Typography>
            </Box>

            {/* Main Content */}
            <Card
              sx={{
                p: 3,
                backgroundColor: "#cff7f0", // Softer background for card
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              }}
            >
              <CardContent>
                <Typography
                  variant="h6"
                  component="h2"
                  color="primary"
                  sx={{ mb: 2, fontWeight: "bold", color: "#f27a8c" }} // Softer primary color
                >
                  بتحس بتعب وإرهاق من أقل مجهود؟ عايز جسم رياضي ورشيق؟ بتعاني من
                  مشاكل الوزن؟
                </Typography>
                <Typography variant="body1" paragraph>
                  عايزه نظام غذائي مناسب لحياتك؟! أنا د. أمنية أحمد، أخصائية
                  التغذية العلاجية والسمنة والنحافة، حاصلة علي بكالوريوس الصيدلة
                  جامعة أسيوط، ودبلومة التغذية العلاجية والسمنة والنحافة جامعة
                  أسيوط.
                </Typography>
                <Typography variant="body1" paragraph>
                  بقدم متابعات واستشارات غذائية علاجية عبر الإنترنت، مخصصة لكل
                  اللي بيعاني من مشاكل الوزن سواء السمنة أو النحافة، ولكل اللي
                  عايز يحسن صحته العامة. وكمان بنقدم تغذية للحوامل والمرضعات
                  والأطفال والرياضيين.
                </Typography>

                <Typography
                  variant="h6"
                  component="h2"
                  color="primary"
                  sx={{ mt: 4, mb: 2, fontWeight: "bold", color: "#f27a8c" }} // Softer primary color
                >
                  في برنامج المتابعة معايا هتحصل علي:
                </Typography>
                <ul>
                  <li>
                    <Typography variant="body1">
                      ✅ خطة تغذوية شخصية مصممة خصيصاً لك.
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body1">
                      ✅ متابعة يومية لضمان التزامك ونجاحك.
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body1">
                      ✅ نصائح عملية تناسب نمط حياتك.
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body1">
                      ✅ دعم مستمر لتحقيق أهدافك الصحية.
                    </Typography>
                  </li>
                </ul>

                <Typography
                  variant="h6"
                  component="h2"
                  color="primary"
                  sx={{ mt: 4, mb: 2, fontWeight: "bold", color: "#f27a8c" }} // Softer primary color
                >
                  ليه تختارني؟
                </Typography>
                <ul>
                  <li>
                    <Typography variant="body1">
                      خبرة في مجال الصيدلة والأدوية لأكثر من ٦ سنوات.
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body1">
                      خبرة واحترافية في تقديم الاستشارات الغذائية لأكثر من خمس
                      سنوات.
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body1">
                      متابعة دقيقة وشخصية لكل حالة.
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body1">
                      دعم مستمر وتحفيز لتحقيق أهدافك الصحية.
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body1">
                      أسعار تنافسية وعروض خاصة.
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
                  اتصل بنا: 01155924248
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant="contained"
                  sx={{
                    background: "#4381c1",
                    color: "#fff",
                    "&:hover": {
                      background: "#2ed8c0",
                    },
                  }}
                  startIcon={<MailOutlineIcon />}
                  href="mailto:omniaalnagy@gmail.com"
                >
                  راسلنا عبر البريد الإلكتروني
                </Button>
              </Grid>
            </Grid>
          </Container>
        </Box>
      </Box>
    </>
  );
}
