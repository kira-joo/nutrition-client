"use client";

import { DictionaryFiles } from "@/constant/DictionaryFiles";
import useI18n from "@/hooks/useI18n";
import { useRTL } from "@/hooks/useRTL";
import { alpha, Box, Button, Container, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { memo, useCallback, useEffect, useMemo, useState } from "react";

interface BottomCTABarProps {
  endDate: Date;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

// Memoized TimeUnit component to prevent unnecessary re-renders
const TimeUnit = memo(({ value, label }: { value: number; label: string }) => {
  const { isRTL } = useRTL();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minWidth: { xs: isRTL ? 32 : 20, md: 40 },
      }}
    >
      <Typography
        variant="h6"
        sx={{
          fontWeight: 800,
          color: "#007B7F",
          fontSize: { xs: "0.8rem", md: "1rem" },
          lineHeight: 1,
        }}
      >
        {String(value).padStart(2, "0")}
      </Typography>
      <Typography
        variant="caption"
        sx={{
          fontSize: isRTL
            ? { xs: "0.7rem", md: "0.8rem" }
            : { xs: "0.5rem", md: "0.7rem" },
          color: "text.secondary",
          textTransform: "uppercase",
          letterSpacing: 0.5,
        }}
      >
        {label}
      </Typography>
    </Box>
  );
});

TimeUnit.displayName = "TimeUnit";

// Separator component
const TimeSeparator = memo(() => (
  <Typography
    sx={{
      color: "#007B7F",
      fontWeight: 700,
      fontSize: { xs: "0.7rem", md: "0.8rem" },
      mx: { xs: 0.25, md: 0.5 },
    }}
  >
    :
  </Typography>
));

TimeSeparator.displayName = "TimeSeparator";

export default function BottomCTABar({ endDate }: BottomCTABarProps) {
  const { t } = useI18n(DictionaryFiles._15DayCamp);
  const { isRTL } = useRTL();
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isExpired, setIsExpired] = useState(false);

  // Memoize endDate timestamp to prevent recalculations
  const endTime = useMemo(() => endDate.getTime(), [endDate]);

  // Optimized time calculation function
  const calculateTimeLeft = useCallback((): TimeLeft => {
    const difference = endTime - Date.now();

    if (difference <= 0) {
      setIsExpired(true);
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    const days = Math.floor(difference / 86400000); // 1000 * 60 * 60 * 24
    const hours = Math.floor((difference % 86400000) / 3600000); // 1000 * 60 * 60
    const minutes = Math.floor((difference % 3600000) / 60000); // 1000 * 60
    const seconds = Math.floor((difference % 60000) / 1000);

    return { days, hours, minutes, seconds };
  }, [endTime]);

  useEffect(() => {
    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [calculateTimeLeft]);

  // Optimized scroll handler
  const handleRegisterClick = useCallback(() => {
    document.getElementById("registration-form")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, []);

  // Early return if expired
  if (isExpired) return null;

  // Memoized common styles
  const containerSx = useMemo(
    () => ({
      position: "fixed" as const,
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      bgcolor: "background.paper",
      boxShadow: `0 -4px 20px ${alpha("#000", 0.15)}`,
      borderTop: `2px solid ${alpha("#4db6b2", 0.3)}`,
      py: { xs: 1.5, md: 2 },
    }),
    []
  );

  const buttonSx = useMemo(
    () => ({
      px: { xs: isRTL ? 1.5 : 3, md: 5 },
      py: { xs: 1, md: 1 },
      fontSize: isRTL
        ? { xs: "0.9rem", md: "1.2rem" }
        : { xs: "0.7rem", md: "1rem" },
      fontWeight: 700,
      background: "linear-gradient(45deg, #4db6b2, #04715d)",
      boxShadow: `0 4px 16px ${alpha("#4db6b2", 0.4)}`,
      borderRadius: 2,
      whiteSpace: "nowrap",
      minWidth: { xs: 100, md: 140 },
      "&:hover": {
        background: "linear-gradient(45deg, #04715d, #00796b)",
        boxShadow: `0 6px 20px ${alpha("#4db6b2", 0.5)}`,
        transform: "translateY(-2px)",
      },
      transition: "all 0.3s ease",
    }),
    [isRTL]
  );

  return (
    <Box sx={containerSx}>
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            textAlign: isRTL ? "right" : "left",
            flexDirection: isRTL ? "row-reverse" : "row",
            gap: { xs: 2, md: 4 },
          }}
        >
          {/* Register Button - Left in AR, Right in EN */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={{
              y: [0, -4, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{ order: isRTL ? 1 : 2 }}
          >
            <Button
              onClick={handleRegisterClick}
              variant="contained"
              size="large"
              sx={buttonSx}
            >
              {t("joinTheCampNow")}
            </Button>
          </motion.div>

          {/* Countdown Timer - Right in AR, Left in EN */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: { xs: 1, md: 2 },
              flex: 1,
              justifyContent: "flex-start",
              order: isRTL ? 2 : 1,
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: "text.secondary",
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                display: { xs: "none", sm: "block" },
                whiteSpace: "nowrap",
              }}
            >
              {t("countdown.title")}:
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: { xs: 0.5, md: 1 },
              }}
            >
              {timeLeft.days > 0 && (
                <>
                  <TimeUnit value={timeLeft.days} label={t("countdown.days")} />
                  <TimeSeparator />
                </>
              )}
              <TimeUnit value={timeLeft.hours} label={t("countdown.hours")} />
              <TimeSeparator />
              <TimeUnit
                value={timeLeft.minutes}
                label={t("countdown.minutes")}
              />
              <TimeSeparator />
              <TimeUnit
                value={timeLeft.seconds}
                label={t("countdown.seconds")}
              />
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
