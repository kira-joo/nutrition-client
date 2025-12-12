"use client";

import { DictionaryFiles } from "@/constant/DictionaryFiles";
import useI18n from "@/hooks/useI18n";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { alpha, Box, Container, Typography } from "@mui/material";
import AnimatedSection from "./AnimatedSection";

export default function CampInfoSection() {
  const { t } = useI18n(DictionaryFiles._15DayCamp);

  const infoPoints = [
    t("campInfo.point1"),
    t("campInfo.point2"),
    t("campInfo.point3"),
    t("campInfo.point4"),
    t("campInfo.point5"),
  ];

  return (
    <AnimatedSection variant="fadeUp" delay={0.2}>
      <Box
        sx={{
          py: { xs: 7, md: 10 },
          background: `linear-gradient(135deg, ${alpha(
            "#b2e0df",
            0.35
          )} 0%, ${alpha("#e3f4f1", 0.7)} 100%)`,
          borderTop: `1px solid ${alpha("#007B7F", 0.15)}`,
          borderBottom: `1px solid ${alpha("#007B7F", 0.15)}`,
        }}
      >
        <Container maxWidth="md">
          <AnimatedSection variant="zoomIn" delay={0.35}>
            <Box
              sx={{
                bgcolor: alpha("#ffffff", 0.9),
                p: { xs: 4, md: 5 },
                borderRadius: 4,
                boxShadow: `0 10px 35px ${alpha("#007B7F", 0.12)}`,
                border: `1px solid ${alpha("#4db6b2", 0.25)}`,
                backdropFilter: "blur(8px)",
              }}
            >
              {/* Title */}
              <Typography
                variant="h5"
                component="h2"
                sx={{
                  fontWeight: 800,
                  mb: 4,
                  fontSize: { xs: "1.7rem", md: "2rem" },
                  color: "#007B7F",
                  textAlign: "center",
                  letterSpacing: "0.3px",
                }}
              >
                {t("campInfo.welcome")}
              </Typography>

              {/* Info List */}
              <Box
                component="ul"
                sx={{
                  listStyle: "none",
                  p: 0,
                  m: 0,
                }}
              >
                {infoPoints.map((point, index) => (
                  <AnimatedSection
                    key={index}
                    variant="slideLeft"
                    delay={0.2 + index * 0.12}
                  >
                    <Box
                      component="li"
                      sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        mb: 3,
                      }}
                    >
                      <CheckCircleIcon
                        sx={{
                          color: "#4db6b2",
                          fontSize: "1.8rem",
                          mr: 2,
                          mt: "2px",
                        }}
                      />

                      <Typography
                        variant="body1"
                        sx={{
                          fontSize: { xs: "1.05rem", md: "1.15rem" },
                          lineHeight: 1.9,
                          color: "text.primary",
                          fontWeight: 500,
                        }}
                      >
                        {point}
                      </Typography>
                    </Box>
                  </AnimatedSection>
                ))}
              </Box>
            </Box>
          </AnimatedSection>
        </Container>
      </Box>
    </AnimatedSection>
  );
}
