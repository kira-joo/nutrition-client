"use client";

import { DictionaryFiles } from "@/constant/DictionaryFiles";
import useI18n from "@/hooks/useI18n";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import { alpha, Box, Button, Container, Typography } from "@mui/material";
import { motion } from "framer-motion";
import AnimatedSection from "./AnimatedSection";

export default function CTASection() {
  const { t } = useI18n(DictionaryFiles._15DayCamp);

  return (
    <AnimatedSection delay={0.2}>
      <Box
        sx={{
          py: { xs: 8, md: 12 },
          background: `linear-gradient(135deg, ${alpha(
            "#1976d2",
            0.95
          )} 0%, ${alpha("#7b1fa2", 0.95)} 100%)`,
          color: "white",
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: -50,
            insetInlineEnd: -50,
            insetInlineStart: "auto",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: alpha("#fff", 0.1),
            filter: "blur(80px)",
            zIndex: 0,
          },
        }}
      >
        <Container maxWidth="md" sx={{ position: "relative", zIndex: 1 }}>
          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="h4"
              component="h2"
              sx={{
                fontWeight: 800,
                mb: 3,
                fontSize: { xs: "2rem", md: "2.75rem" },
                textShadow: "0 2px 10px rgba(0,0,0,0.2)",
              }}
            >
              {t("readyToTransformYourHealth")}
            </Typography>
            <Typography
              variant="h6"
              sx={{
                mb: 5,
                fontSize: { xs: "1rem", md: "1.2rem" },
                opacity: 0.95,
                lineHeight: 1.6,
              }}
            >
              {t("joinHundredsSatisfiedClients")}
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
              }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Button
                  onClick={() => {
                    const formElement =
                      document.getElementById("registration-form");
                    if (formElement) {
                      formElement.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                    }
                  }}
                  variant="contained"
                  size="large"
                  sx={{
                    px: 6,
                    py: 2.5,
                    fontSize: { xs: "1.1rem", md: "1.3rem" },
                    fontWeight: 700,
                    bgcolor: "white",
                    color: "primary.main",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
                    borderRadius: 3,
                    "&:hover": {
                      bgcolor: "grey.100",
                      boxShadow: "0 12px 32px rgba(0,0,0,0.4)",
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  {t("joinTheCampNow")}
                </Button>
              </motion.div>
              <motion.div
                animate={{
                  y: [0, 8, 0],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                onClick={() => {
                  const formElement =
                    document.getElementById("registration-form");
                  if (formElement) {
                    formElement.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }
                }}
                style={{ cursor: "pointer" }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: "0.85rem",
                      opacity: 0.9,
                      fontWeight: 500,
                    }}
                  >
                    {t("startYourChangeToday")}
                  </Typography>
                  <ArrowUpwardIcon
                    sx={{
                      fontSize: 32,
                      opacity: 0.8,
                      color: "white",
                    }}
                  />
                </Box>
              </motion.div>
            </Box>
          </Box>
        </Container>
      </Box>
    </AnimatedSection>
  );
}
