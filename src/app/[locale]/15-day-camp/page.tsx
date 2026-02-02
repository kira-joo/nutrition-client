"use client";

import { Box } from "@mui/material";
import { useState } from "react";
import BottomCTABar from "./components/BottomCTABar";
import CampInfoSection from "./components/CampInfoSection";
import CountdownSection from "./components/CountdownSection";
import CTASection from "./components/CTASection";
import FAQSection from "./components/FAQSection";
import FeaturesSection from "./components/FeaturesSection";
import HeroSection from "./components/HeroSection";
import ProgramComparisonSection from "./components/ProgramComparisonSection";
import RegistrationFormSection from "./components/RegistrationFormSection";

/**
 * LandingPage Component
 *
 * Main landing page with all sections wrapped in AnimatedSection components.
 * All existing logic is preserved:
 * - selectedProgram state management
 * - trackViewContent tracking
 * - campEndDate logic
 */

type ProgramType = "Weight Loss" | "Weight Gain" | null;

export default function LandingPage() {
  const [selectedProgram, setSelectedProgram] = useState<ProgramType>(null);

  // Set the camp end date (15 days from now, or customize as needed)
  // You can change this to a specific date, e.g., new Date("2024-12-31T23:59:59")
  const campEndDate = new Date("2026-12-15");
  campEndDate.setDate(campEndDate.getDate());
  campEndDate.setHours(23, 59, 59, 999); // End of day

  const handleProgramSelect = (program: "Weight Loss" | "Weight Gain") => {
    setSelectedProgram(program);
    // Scroll to form after selection
    setTimeout(() => {
      const formElement = document.getElementById("registration-form");
      if (formElement) {
        formElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  return (
    <Box sx={{ pb: { xs: 12, md: 14 } }}>
      <HeroSection
        onProgramSelect={handleProgramSelect}
        selectedProgram={selectedProgram}
      />
      <CountdownSection endDate={campEndDate} />
      <ProgramComparisonSection
        selectedProgram={selectedProgram}
        onProgramSelect={handleProgramSelect}
      />
      <FeaturesSection />
      {/* <TestimonialsSection /> */}
      <FAQSection />
      <CampInfoSection />
      <RegistrationFormSection selectedProgram={selectedProgram} />
      <CTASection />
      <BottomCTABar endDate={campEndDate} />
    </Box>
  );
}
