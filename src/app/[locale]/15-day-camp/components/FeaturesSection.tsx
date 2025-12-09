"use client";

import { DictionaryFiles } from "@/constant/DictionaryFiles";
import useI18n from "@/hooks/useI18n";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import {
  alpha,
  Box,
  Card,
  Container,
  Grid,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { motion } from "framer-motion";
import AnimatedSection from "./AnimatedSection";

export default function FeaturesSection() {
  const { t } = useI18n(DictionaryFiles._15DayCamp);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const features = [
    {
      title: t("expertGuidance"),
      description: t("expertGuidanceDescription"),
      icon: CheckCircleIcon,
      color: "#1976d2",
    },
    {
      title: t("support24_7"),
      description: t("support24_7Description"),
      icon: SupportAgentIcon,
      color: "#4caf50",
    },
    {
      title: t("trackProgress"),
      description: t("trackProgressDescription"),
      icon: TrackChangesIcon,
      color: "#7b1fa2",
    },
  ];

  return (
    <AnimatedSection delay={0.2}>
      <Box
        sx={{
          py: { xs: 8, md: 12 },
          background: `linear-gradient(135deg, ${alpha(
            "#f5f5f5",
            0.8
          )} 0%, ${alpha("#e0f2f1", 0.4)} 100%)`,
          position: "relative",
          borderTop: `1px solid ${alpha("#4db6b2", 0.2)}`,
          borderBottom: `1px solid ${alpha("#4db6b2", 0.2)}`,
        }}
      >
        <Container maxWidth="lg">
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
            {t("whyChooseOurProgram")}
          </Typography>
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <motion.div
                  initial={
                    isMobile
                      ? { opacity: 0, y: 30, scale: 0.98, rotate: 0 }
                      : { opacity: 0, y: 60 }
                  }
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.6,
                    delay: 0.15 * index,
                    ease: [0.4, 0, 0.2, 1],
                  }}
                  whileHover={{ y: -6, scale: 1.05, rotate: 0 }}
                >
                  <Box
                    component={Card}
                    sx={{
                      height: "100%",
                      p: 4,
                      textAlign: "center",
                      boxShadow: `0 4px 20px ${alpha("#007B7F", 0.1)}`,
                      borderRadius: 4,
                      border: `1px solid ${alpha(feature.color, 0.2)}`,
                      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                      position: "relative",
                      overflow: "visible",
                      "&:hover": {
                        transform: "scale(1.05) rotate(2deg)",
                        boxShadow: `0 12px 40px ${alpha(feature.color, 0.25)}`,
                        borderColor: alpha(feature.color, 0.4),
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: "inline-flex",
                        p: 3,
                        bgcolor: alpha(feature.color, 0.1),
                        borderRadius: "50%",
                        mb: 3,
                        boxShadow: `0 8px 24px ${alpha(feature.color, 0.2)}`,
                        transition: "all 0.4s ease",
                        "&:hover": {
                          transform: "scale(1.15) rotate(10deg)",
                          boxShadow: `0 12px 32px ${alpha(feature.color, 0.3)}`,
                        },
                      }}
                    >
                      <feature.icon
                        sx={{ fontSize: 40, color: feature.color }}
                      />
                    </Box>
                    <Typography
                      variant="h6"
                      component="h3"
                      sx={{
                        fontWeight: 700,
                        mb: 2,
                        fontSize: "1.25rem",
                        color: "#007B7F",
                      }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ lineHeight: 1.7, fontSize: "0.95rem" }}
                    >
                      {feature.description}
                    </Typography>
                  </Box>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </AnimatedSection>
  );
}
