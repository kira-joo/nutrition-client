"use client";

import { DictionaryFiles } from "@/constant/DictionaryFiles";
import useI18n from "@/hooks/useI18n";
import { useIsRtl } from "@/hooks/useIsRtl";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { alpha, Box, Card, Container, Grid, Typography } from "@mui/material";
import AnimatedSection from "./AnimatedSection";

interface ProgramComparisonSectionProps {
  selectedProgram: "Weight Loss" | "Weight Gain" | null;
  onProgramSelect: (program: "Weight Loss" | "Weight Gain") => void;
}

export default function ProgramComparisonSection({
  selectedProgram,
  onProgramSelect,
}: ProgramComparisonSectionProps) {
  const { t } = useI18n(DictionaryFiles._15DayCamp);
  const isRTL = useIsRtl();

  const weightLossFeatures = [
    t("customizedMealPlans"),
    t("regularProgressTracking"),
    t("expertNutritionistSupport"),
    t("sustainableLifestyleChanges"),
  ];

  const weightGainFeatures = [
    t("highCalorieNutritiousMeals"),
    t("muscleBuildingStrategies"),
    t("personalizedGuidance"),
    t("healthyWeightGainApproach"),
  ];

  return (
    <AnimatedSection variant="fadeUp" delay={0.2}>
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
          {t("chooseYourProgram")}
        </Typography>
        <Grid container spacing={4}>
          {/* Weight Loss Program */}
          <Grid item xs={12} md={6}>
            <AnimatedSection variant="fadeUp" delay={0.3}>
              <Card
                onClick={() => onProgramSelect("Weight Loss")}
                sx={{
                  height: "100%",
                  p: { xs: 3, md: 4 },
                  cursor: "pointer",
                  border: 3,
                  borderColor:
                    selectedProgram === "Weight Loss"
                      ? "primary.main"
                      : alpha("#1976d2", 0.2),
                  bgcolor:
                    selectedProgram === "Weight Loss"
                      ? alpha("#1976d2", 0.05)
                      : "background.paper",
                  boxShadow:
                    selectedProgram === "Weight Loss"
                      ? `0 12px 40px ${alpha("#1976d2", 0.3)}`
                      : 2,
                  borderRadius: 4,
                  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": {
                    boxShadow: `0 16px 48px ${alpha("#1976d2", 0.25)}`,
                    borderColor: "primary.main",
                    transform: "translateY(-4px)",
                  },
                }}
              >
                <Box sx={{ textAlign: "center", mb: 4 }}>
                  <Box
                    sx={{
                      display: "inline-flex",
                      p: 3,
                      bgcolor: alpha("#1976d2", 0.15),
                      borderRadius: "50%",
                      mb: 3,
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "scale(1.1) rotate(5deg)",
                      },
                    }}
                  >
                    <TrendingDownIcon
                      sx={{ fontSize: 56, color: "primary.main" }}
                    />
                  </Box>
                  <Typography
                    variant="h5"
                    component="h3"
                    sx={{ fontWeight: 800, mb: 1.5, color: "#007B7F" }}
                  >
                    {t("weightLoss")} {t("weightLossArabic")}
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ fontSize: "1rem" }}
                  >
                    {t("weightLossDescription")}
                  </Typography>
                </Box>
                <Box component="ul" sx={{ listStyle: "none", p: 0, m: 0 }}>
                  {weightLossFeatures.map((item, index) => (
                    <AnimatedSection
                      key={index}
                      variant="fadeUp"
                      delay={0.4 + index * 0.1}
                    >
                      <Box
                        component="li"
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          mb: 2.5,
                          flexDirection: isRTL ? "row-reverse" : "row",
                          gap: 1.5,
                          textAlign: "start",
                        }}
                      >
                        <CheckCircleIcon
                          sx={{
                            color: "success.main",
                            fontSize: 24,
                            flexShrink: 0,
                          }}
                        />
                        <Typography
                          variant="body1"
                          sx={{
                            fontSize: "0.95rem",
                            lineHeight: 1.6,
                            width: "100%",
                            textAlign: "start",
                          }}
                        >
                          {item}
                        </Typography>
                      </Box>
                    </AnimatedSection>
                  ))}
                </Box>
              </Card>
            </AnimatedSection>
          </Grid>

          {/* Weight Gain Program */}
          <Grid item xs={12} md={6}>
            <AnimatedSection variant="fadeUp" delay={0.3}>
              <Card
                onClick={() => onProgramSelect("Weight Gain")}
                sx={{
                  height: "100%",
                  p: { xs: 3, md: 4 },
                  cursor: "pointer",
                  border: 3,
                  borderColor:
                    selectedProgram === "Weight Gain"
                      ? "secondary.main"
                      : alpha("#7b1fa2", 0.2),
                  bgcolor:
                    selectedProgram === "Weight Gain"
                      ? alpha("#7b1fa2", 0.05)
                      : "background.paper",
                  boxShadow:
                    selectedProgram === "Weight Gain"
                      ? `0 12px 40px ${alpha("#7b1fa2", 0.3)}`
                      : 2,
                  borderRadius: 4,
                  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": {
                    boxShadow: `0 16px 48px ${alpha("#7b1fa2", 0.25)}`,
                    borderColor: "secondary.main",
                    transform: "translateY(-4px)",
                  },
                }}
              >
                <Box sx={{ textAlign: "center", mb: 4 }}>
                  <Box
                    sx={{
                      display: "inline-flex",
                      p: 3,
                      bgcolor: alpha("#7b1fa2", 0.15),
                      borderRadius: "50%",
                      mb: 3,
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "scale(1.1) rotate(-5deg)",
                      },
                    }}
                  >
                    <TrendingUpIcon
                      sx={{ fontSize: 56, color: "secondary.main" }}
                    />
                  </Box>
                  <Typography
                    variant="h5"
                    component="h3"
                    sx={{ fontWeight: 800, mb: 1.5, color: "#7b1fa2" }}
                  >
                    {t("weightGain")} {t("weightGainArabic")}
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ fontSize: "1rem" }}
                  >
                    {t("weightGainDescription")}
                  </Typography>
                </Box>
                <Box component="ul" sx={{ listStyle: "none", p: 0, m: 0 }}>
                  {weightGainFeatures.map((item, index) => (
                    <AnimatedSection
                      key={index}
                      variant="fadeUp"
                      delay={0.4 + index * 0.1}
                    >
                      <Box
                        component="li"
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          mb: 2.5,
                          flexDirection: isRTL ? "row-reverse" : "row",
                          gap: 1.5,
                          textAlign: "start",
                        }}
                      >
                        <CheckCircleIcon
                          sx={{
                            color: "success.main",
                            fontSize: 24,
                            flexShrink: 0,
                          }}
                        />
                        <Typography
                          variant="body1"
                          sx={{
                            fontSize: "0.95rem",
                            lineHeight: 1.6,
                            width: "100%",
                            textAlign: "start",
                          }}
                        >
                          {item}
                        </Typography>
                      </Box>
                    </AnimatedSection>
                  ))}
                </Box>
              </Card>
            </AnimatedSection>
          </Grid>
        </Grid>
      </Container>
    </AnimatedSection>
  );
}
