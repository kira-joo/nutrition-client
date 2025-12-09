"use client";

import { DictionaryFiles } from "@/constant/DictionaryFiles";
import useI18n from "@/hooks/useI18n";
import { useRTL } from "@/hooks/useRTL";
import {
  alpha,
  Avatar,
  Box,
  Card,
  Container,
  Grid,
  Typography,
} from "@mui/material";

export default function TestimonialsSection() {
  const { t } = useI18n(DictionaryFiles._15DayCamp);
  const { isRTL } = useRTL();

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
      <Typography
        variant="h4"
        component="h2"
        sx={{
          fontWeight: 800,
          textAlign: "center",
          mb: 8,
          fontSize: { xs: "2rem", md: "2.75rem" },
          color: "#007B7F",
        }}
      >
        {t("successStories")}
      </Typography>
      <Grid container spacing={4}>
        {[1, 2, 3].map((i) => (
          <Grid item xs={12} md={4} key={i}>
            <Card
              sx={{
                height: "100%",
                p: 4,
                boxShadow: `0 4px 20px ${alpha("#007B7F", 0.1)}`,
                border: `1px solid ${alpha("#4db6b2", 0.2)}`,
                borderRadius: 3,
                transition: "all 0.3s ease",
                "&:hover": {
                  boxShadow: `0 8px 32px ${alpha("#4db6b2", 0.2)}`,
                  transform: "translateY(-4px)",
                },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mb: 3,
                  flexDirection: isRTL ? "row-reverse" : "row",
                }}
              >
                <Avatar
                  sx={{
                    width: 64,
                    height: 64,
                    bgcolor: alpha("#4db6b2", 0.2),
                    ...(isRTL ? { ml: 2 } : { mr: 2 }),
                    border: `3px solid ${alpha("#4db6b2", 0.3)}`,
                  }}
                >
                  {i}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 700,
                      color: "#007B7F",
                      textAlign: isRTL ? "right" : "left",
                    }}
                  >
                    {t("client")} {i}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      textAlign: isRTL ? "right" : "left",
                      display: "block",
                    }}
                  >
                    {t("programParticipant")}
                  </Typography>
                </Box>
              </Box>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  fontStyle: "italic",
                  lineHeight: 1.7,
                  fontSize: "0.95rem",
                  textAlign: isRTL ? "right" : "left",
                  direction: isRTL ? "rtl" : "ltr",
                }}
              >
                "{t("testimonialText")}"
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
