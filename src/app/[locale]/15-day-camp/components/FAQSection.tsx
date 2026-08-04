"use client";

import { DictionaryFiles } from "@/constant/DictionaryFiles";
import useI18n from "@/hooks/useI18n";
import { useIsRtl } from "@/hooks/useIsRtl";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  alpha,
  Box,
  Container,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { motion } from "framer-motion";
import AnimatedSection from "./AnimatedSection";

export default function FAQSection() {
  const { t } = useI18n(DictionaryFiles._15DayCamp);
  const isRTL = useIsRtl();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const faqs = [
    { question: t("faq1Question"), answer: t("faq1Answer") },
    { question: t("faq2Question"), answer: t("faq2Answer") },
    { question: t("faq3Question"), answer: t("faq3Answer") },
    { question: t("faq4Question"), answer: t("faq4Answer") },
  ];

  return (
    <AnimatedSection variant="slideRight" delay={0.2}>
      <Box
        sx={{
          py: { xs: 8, md: 12 },
          background: `linear-gradient(135deg, ${alpha(
            "#f5f5f5",
            0.8
          )} 0%, ${alpha("#e0f2f1", 0.4)} 100%)`,
          borderTop: `1px solid ${alpha("#4db6b2", 0.2)}`,
        }}
      >
        <Container maxWidth="md">
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
            {t("frequentlyAskedQuestions")}
            {isRTL && (
              <span style={{ color: "red", fontSize: "3rem", fontWeight: 800 }}>
                ؟
              </span>
            )}
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={
                  isMobile
                    ? { opacity: 0, y: 20, scale: 0.98, rotate: 0 }
                    : { opacity: 0, y: 30 }
                }
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  delay: index * 0.1,
                  duration: 0.5,
                  ease: [0.4, 0, 0.2, 1],
                }}
                whileHover={{ scale: 1.02 }}
              >
                <Accordion
                  sx={{
                    boxShadow: `0 4px 20px ${alpha("#007B7F", 0.1)}`,
                    borderRadius: 3,
                    border: `2px solid ${alpha("#4db6b2", 0.3)}`,
                    "&:before": { display: "none" },
                    "&.Mui-expanded": {
                      margin: "16px 0",
                      borderColor: alpha("#4db6b2", 0.5),
                      boxShadow: `0 8px 32px ${alpha("#4db6b2", 0.2)}`,
                    },
                  }}
                >
                  <AccordionSummary
                    expandIcon={
                      <ExpandMoreIcon sx={{ color: "#007B7F", fontSize: 32 }} />
                    }
                    aria-controls={`panel${index}-content`}
                    id={`panel${index}-header`}
                    sx={{
                      px: 3,
                      py: 2,
                      "&:hover": { bgcolor: alpha("#4db6b2", 0.05) },
                    }}
                  >
                    <Typography
                      variant="h6"
                      component="h3"
                      sx={{
                        fontWeight: 700,
                        color: "#007B7F",
                        fontSize: { xs: "1rem", md: "1.1rem" },
                      }}
                    >
                      {faq.question}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ px: 3, pb: 3 }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        lineHeight: 1.8,
                        fontSize: "0.95rem",
                        textAlign: "start",
                      }}
                    >
                      {faq.answer}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              </motion.div>
            ))}
          </Box>
        </Container>
      </Box>
    </AnimatedSection>
  );
}
