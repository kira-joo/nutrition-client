"use client";

import LandingForm from "@/app/components/LandingForm";
import { DictionaryFiles } from "@/constant/DictionaryFiles";
import useI18n from "@/hooks/useI18n";
import { alpha, Box, Container, Typography } from "@mui/material";
import AnimatedSection from "./AnimatedSection";

interface RegistrationFormSectionProps {
  selectedProgram: "Weight Loss" | "Weight Gain" | null;
}

export default function RegistrationFormSection({
  selectedProgram,
}: RegistrationFormSectionProps) {
  const { t } = useI18n(DictionaryFiles._15DayCamp);

  return (
    <AnimatedSection variant="fadeUp" delay={0.2}>
      <Box
        id="registration-form"
        sx={{
          py: { xs: 8, md: 12 },
          borderTop: `1px solid ${alpha("#4db6b2", 0.2)}`,
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: 6 }}>
            <Typography
              variant="h4"
              component="h2"
              sx={{
                fontWeight: 800,
                mb: 2,
                fontSize: { xs: "2rem", md: "2.75rem" },
                color: "#007B7F",
              }}
            >
              {t("startYourJourneyToday")}
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ fontSize: { xs: "1rem", md: "1.2rem" } }}
            >
              {selectedProgram
                ? `${t("youveSelected")} ${selectedProgram} ${t("program")}`
                : t("selectProgramAbove")}
            </Typography>
          </Box>
          <LandingForm selectedProgram={selectedProgram} />
        </Container>
      </Box>
    </AnimatedSection>
  );
}
