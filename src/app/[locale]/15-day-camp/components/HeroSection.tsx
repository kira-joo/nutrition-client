"use client";

import { DictionaryFiles } from "@/constant/DictionaryFiles";
import useI18n from "@/hooks/useI18n";
import { alpha, Box, Button, Container, Typography } from "@mui/material";
import { motion } from "framer-motion";
import AnimatedSection from "./AnimatedSection";

interface HeroSectionProps {
  onProgramSelect: (program: "Weight Loss" | "Weight Gain") => void;
  selectedProgram: "Weight Loss" | "Weight Gain" | null;
}

// Motion-enabled Button
const MotionButton = motion(Button);

export default function HeroSection({
  onProgramSelect,
  selectedProgram,
}: HeroSectionProps) {
  const { t } = useI18n(DictionaryFiles._15DayCamp);

  return (
    <AnimatedSection variant="zoomIn" delay={0.1}>
      <Box
        sx={{
          position: "relative",
          py: { xs: 8, md: 15 },
          background: `linear-gradient(135deg, ${alpha(
            "#1976d2",
            0.95
          )} 0%, ${alpha("#7b1fa2", 0.95)} 100%)`,
          color: "white",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: -100,
            insetInlineEnd: -100,
            insetInlineStart: "auto",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: alpha("#fff", 0.1),
            filter: "blur(100px)",
            zIndex: 0,
            animation: "floating 6s ease-in-out infinite",
          },
          "&::after": {
            content: '""',
            position: "absolute",
            bottom: -150,
            insetInlineStart: -150,
            insetInlineEnd: "auto",
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: alpha("#fff", 0.08),
            filter: "blur(120px)",
            zIndex: 0,
            animation: "floating 6s ease-in-out infinite",
          },
          "@keyframes floating": {
            "0%": { transform: "translateY(0px)" },
            "50%": { transform: "translateY(-15px)" },
            "100%": { transform: "translateY(0px)" },
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="h2"
              component="h1"
              sx={{
                fontWeight: 800,
                fontSize: { xs: "2.5rem", md: "3.5rem", lg: "4.5rem" },
                mb: 3,
                lineHeight: 1.2,
                textShadow: "0 2px 10px rgba(0,0,0,0.2)",
              }}
            >
              {t("heroTitle")}
            </Typography>
            <Typography
              variant="h6"
              component="p"
              sx={{
                mb: 5,
                maxWidth: 800,
                mx: "auto",
                fontSize: { xs: "1.1rem", md: "1.3rem" },
                lineHeight: 1.6,
                opacity: 0.95,
              }}
            >
              {t("heroSubtitle")}
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: 3,
              }}
            >
              <MotionButton
                onClick={() => onProgramSelect("Weight Loss")}
                variant={
                  selectedProgram === "Weight Loss" ? "contained" : "outlined"
                }
                size="large"
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 200 }}
                sx={{
                  px: 5,
                  py: 2,
                  fontSize: "1.2rem",
                  fontWeight: 700,
                  bgcolor:
                    selectedProgram === "Weight Loss" ? "white" : "transparent",
                  color:
                    selectedProgram === "Weight Loss"
                      ? "primary.main"
                      : "white",
                  borderColor: "white",
                  borderWidth: 2,
                  borderRadius: 3,
                  boxShadow:
                    selectedProgram === "Weight Loss"
                      ? "0 8px 24px rgba(0,0,0,0.3)"
                      : "none",
                  "&:hover": {
                    bgcolor:
                      selectedProgram === "Weight Loss"
                        ? "grey.100"
                        : alpha("#fff", 0.2),
                    borderColor: "white",
                  },
                  transition: "all 0.3s ease",
                  transform:
                    selectedProgram === "Weight Loss" ? "scale(1.05)" : "none",
                }}
              >
                {t("weightLossProgram")}
              </MotionButton>

              <MotionButton
                onClick={() => onProgramSelect("Weight Gain")}
                variant={
                  selectedProgram === "Weight Gain" ? "contained" : "outlined"
                }
                size="large"
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 200 }}
                sx={{
                  px: 5,
                  py: 2,
                  fontSize: "1.2rem",
                  fontWeight: 700,
                  bgcolor:
                    selectedProgram === "Weight Gain" ? "white" : "transparent",
                  color:
                    selectedProgram === "Weight Gain"
                      ? "secondary.main"
                      : "white",
                  borderColor: "white",
                  borderWidth: 2,
                  borderRadius: 3,
                  boxShadow:
                    selectedProgram === "Weight Gain"
                      ? "0 8px 24px rgba(0,0,0,0.3)"
                      : "none",
                  "&:hover": {
                    bgcolor:
                      selectedProgram === "Weight Gain"
                        ? "grey.100"
                        : alpha("#fff", 0.2),
                    borderColor: "white",
                  },
                  transition: "all 0.3s ease",
                  transform:
                    selectedProgram === "Weight Gain" ? "scale(1.05)" : "none",
                }}
              >
                {t("weightGainProgram")}
              </MotionButton>
            </Box>
          </Box>
        </Container>
      </Box>
    </AnimatedSection>
  );
}
