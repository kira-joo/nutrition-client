"use client";

import { Box } from "@mui/material";
import { motion, useInView } from "framer-motion";
import { useRef, type ReactNode } from "react";

interface AnimatedSectionProps {
  children: ReactNode;
  delay?: number;
  variant?: "fadeUp" | "fadeIn" | "zoomIn" | "slideLeft" | "slideRight";
}

export default function AnimatedSection({
  children,
  delay = 0,
  variant = "fadeUp",
}: AnimatedSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.2 });

  const variants = {
    fadeUp: {
      initial: { opacity: 0, y: 50 },
      animate: { opacity: 1, y: 0 },
    },
    fadeIn: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
    },
    zoomIn: {
      initial: { opacity: 0, scale: 0.85 },
      animate: { opacity: 1, scale: 1 },
    },
    slideLeft: {
      initial: { opacity: 0, x: 50 },
      animate: { opacity: 1, x: 0 },
    },
    slideRight: {
      initial: { opacity: 0, x: -50 },
      animate: { opacity: 1, x: 0 },
    },
  };

  const selectedVariant = variants[variant];

  return (
    <Box
      ref={ref}
      component={motion.div}
      initial={selectedVariant.initial}
      animate={isInView ? selectedVariant.animate : selectedVariant.initial}
      transition={{ duration: 0.65, delay, ease: [0.4, 0, 0.2, 1] }}
      sx={{ willChange: "opacity, transform" }}
    >
      {children}
    </Box>
  );
}
