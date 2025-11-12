"use client";

import { Locale } from "@/constant/Locale.enum";
import { CssBaseline } from "@mui/material";
import { ThemeProvider as MUIThemeProvider } from "@mui/material/styles";
import { useMemo } from "react";
import { createAppTheme } from "../theme/theme";

interface ThemeProviderProps {
  children: React.ReactNode;
  locale: Locale;
}

export default function ThemeProvider({
  children,
  locale,
}: ThemeProviderProps) {
  const theme = useMemo(() => createAppTheme(locale), [locale]);

  return (
    <MUIThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MUIThemeProvider>
  );
}
