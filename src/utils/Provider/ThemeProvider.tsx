"use client";

import { ThemeProvider as MUIThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import { Locale } from "@/constant/Locale.enum";
import { createAppTheme } from "../theme/theme";
import { useMemo } from "react";

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

