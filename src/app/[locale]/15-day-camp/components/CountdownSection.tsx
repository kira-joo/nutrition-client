"use client";

import { DictionaryFiles } from "@/constant/DictionaryFiles";
import useI18n from "@/hooks/useI18n";
import { alpha, Box, Card, Container, Grid, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import AnimatedSection from "./AnimatedSection";

interface CountdownSectionProps {
  endDate: Date;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function CountdownSection({ endDate }: CountdownSectionProps) {
  const { t } = useI18n(DictionaryFiles._15DayCamp);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const end = endDate.getTime();
      const difference = end - now;

      if (difference <= 0) {
        setIsExpired(true);
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
        };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor(
          (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        ),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  if (isExpired) {
    return null;
  }

  const timeUnits = [
    { value: timeLeft.days, label: t("countdown.days") },
    { value: timeLeft.hours, label: t("countdown.hours") },
    { value: timeLeft.minutes, label: t("countdown.minutes") },
    { value: timeLeft.seconds, label: t("countdown.seconds") },
  ];

  return (
    <AnimatedSection delay={0.2}>
      <Box
        sx={{
          py: { xs: 4, md: 6 },
          background: `linear-gradient(135deg, ${alpha(
            "#007B7F",
            0.08
          )} 0%, ${alpha("#4db6b2", 0.05)} 100%)`,
          borderTop: `1px solid ${alpha("#4db6b2", 0.2)}`,
          borderBottom: `1px solid ${alpha("#4db6b2", 0.2)}`,
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Typography
              variant="h5"
              component="h2"
              sx={{
                fontWeight: 700,
                mb: 1,
                color: "#007B7F",
                fontSize: { xs: "1.25rem", md: "1.5rem" },
              }}
            >
              {t("countdown.title")}
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ fontSize: { xs: "0.9rem", md: "1rem" } }}
            >
              {t("countdown.subtitle")}
            </Typography>
          </Box>

          <Grid container spacing={2} justifyContent="center">
            {timeUnits.map((unit, index) => (
              <Grid item xs={6} sm={3} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    delay: 0.3 + index * 0.1,
                    duration: 0.6,
                    ease: [0.4, 0, 0.2, 1],
                  }}
                  whileHover={{ scale: 1.05, y: -4 }}
                >
                  <Card
                    sx={{
                      p: { xs: 2, md: 3 },
                      textAlign: "center",
                      bgcolor: "background.paper",
                      boxShadow: `0 4px 20px ${alpha("#007B7F", 0.15)}`,
                      border: `2px solid ${alpha("#4db6b2", 0.3)}`,
                      borderRadius: 3,
                      position: "relative",
                      overflow: "hidden",
                      "&::after": {
                        content: '""',
                        position: "absolute",
                        top: "-50%",
                        left: "-50%",
                        width: "200%",
                        height: "200%",
                        background: alpha("#007B7F", 0.02),
                        borderRadius: "50%",
                        animation: "float 6s ease-in-out infinite",
                        zIndex: 0,
                      },
                      "@keyframes float": {
                        "0%": { transform: "translateY(0px)" },
                        "50%": { transform: "translateY(-10px)" },
                        "100%": { transform: "translateY(0px)" },
                      },
                    }}
                  >
                    <Typography
                      variant="h3"
                      component="div"
                      sx={{
                        position: "relative",
                        zIndex: 1,
                        fontWeight: 800,
                        color: "#007B7F",
                        fontSize: { xs: "2rem", md: "3rem" },
                        lineHeight: 1.2,
                        mb: 1,
                      }}
                    >
                      {String(unit.value).padStart(2, "0")}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        position: "relative",
                        zIndex: 1,
                        color: "text.secondary",
                        fontWeight: 600,
                        fontSize: { xs: "0.75rem", md: "0.875rem" },
                        textTransform: "uppercase",
                        letterSpacing: 1,
                      }}
                    >
                      {unit.label} {/* Emojis موجودة داخل الترجمة */}
                    </Typography>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </AnimatedSection>
  );
}
