"use client";
import { DictionaryFiles } from "@/constant/DictionaryFiles";
import useI18n from "@/hooks/useI18n";
import {
  alpha,
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Container,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import { Check, Diamond, Package, Zap } from "lucide-react";
import { useState } from "react";
type Duration = {
  id: string;
  label: string;
};
const durations: Duration[] = [
  { id: "month", label: "month" },
  { id: "quarter", label: "quarter" },
  { id: "half", label: "half" },
];

const Packages = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedDuration, setSelectedDuration] = useState("month");
  const { t } = useI18n(DictionaryFiles.Packages);

  type PackageData = {
    category: string;
    icon: React.ReactNode;
    color: string;
    popular: boolean;
    numberOfDetails: number;
  };

  const packagesData: PackageData[] = [
    {
      category: "Basic",
      icon: <Zap size={24} />,
      color: "#4db6b2",
      popular: false,
      numberOfDetails: 4,
    },
    {
      category: "Standard",
      icon: <Package size={24} />,
      color: "#04715d",
      popular: true,
      numberOfDetails: 6,
    },
    {
      category: "Premium",
      icon: <Diamond size={24} />,
      color: "#00796b",
      popular: false,
      numberOfDetails: 7,
    },
  ];

  const pageStyles = {
    container: {
      backgroundColor: "#ffffff",
      color: "#333333",
      minHeight: "100vh",
      py: { xs: 6, md: 12 },
      px: { xs: 2, sm: 3, lg: 4 },
      background:
        "linear-gradient(135deg, rgba(100, 100, 100, 0.1), rgba(255, 255, 255, 0.1))",
    },
    header: {
      textAlign: "center",
      mb: { xs: 6, md: 12 },
    },
    subtitle: {
      fontSize: "0.875rem",
      color: "#666666",
      mb: 1,
      letterSpacing: "0.05em",
      fontWeight: 600,
    },
    title: {
      fontSize: { xs: "1.875rem", sm: "2.25rem", lg: "3rem" },
      fontWeight: 800,
      lineHeight: 1.1,
      mb: 4,
      color: "#333333",
    },
    titleAccent: {
      background: "linear-gradient(45deg, #4db6b2, #04715d)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
    },
    durationSelector: {
      mt: 4,
      display: "inline-flex",
      border: "1px solid #ddd",
      borderRadius: 2,
      backgroundColor: "#f9f9f9",
      p: 0.5,
    },
    durationButton: {
      px: 2,
      py: 1,
      fontSize: "0.875rem",
      fontWeight: 500,
      borderRadius: 1,
      textTransform: "none",
      minWidth: "auto",
      color: "#666666",
      "&:hover": { backgroundColor: "#e9e9e9" },
    },
    activeDurationButton: {
      backgroundColor: "#4db6b2",
      color: "white",
      "&:hover": { backgroundColor: "#04715d" },
    },
  };

  const getCardStyles = (pkg: (typeof packagesData)[0], index: number) => ({
    height: "100%",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#ffffff",
    border: `2px solid ${pkg.popular ? "#4db6b2" : "#ddd"}`,
    borderRadius: 4,
    transition: "all 0.3s ease-in-out",
    transform: hoveredIndex === index ? "scale(1.05)" : "scale(1)",
    boxShadow: pkg.popular
      ? `0 0 0 4px ${alpha("#4db6b2", 0.3)}`
      : hoveredIndex === index
      ? "0px 8px 20px rgba(0, 0, 0, 0.15)"
      : "0px 2px 8px rgba(0, 0, 0, 0.1)",
    "&:hover": {
      transform: "scale(1.05)",
      boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.15)",
    },
  });

  const getIconStyles = (color: string) => ({
    backgroundColor: alpha(color, 0.1),
    color: color,
    width: 56,
    height: 56,
    mb: 2,
    border: `2px solid ${alpha(color, 0.3)}`,
  });

  const getPriceStyles = () => ({
    display: "flex",
    justifyContent: "center",
    alignItems: "baseline",
    gap: 1,
    mb: 3,
  });

  const getGradientButtonStyles = (isPopular: boolean) => ({
    width: "100%",
    py: 1.5,
    fontWeight: 600,
    textTransform: "uppercase",
    background: isPopular
      ? "linear-gradient(45deg, #4db6b2, #04715d)"
      : "#4db6b2",
    color: "white",
    "&:hover": {
      background: isPopular
        ? "linear-gradient(45deg, #04715d, #00796b)"
        : "#04715d",
      transform: "scale(1.02)",
    },
    boxShadow: "0px 4px 12px rgba(77, 182, 178, 0.3)",
    transition: "all 0.3s ease",
  });

  return (
    <Box sx={pageStyles.container}>
      <Container maxWidth="xl">
        <Box sx={pageStyles.header}>
          <Typography sx={pageStyles.subtitle}>{t("subtitle")}</Typography>

          <Typography variant="h1" sx={pageStyles.title}>
            {t("title")}
            <Box component="br" />
            <Box component="span" sx={pageStyles.titleAccent}>
              {t("titleAccent")}
            </Box>
          </Typography>

          <Box sx={pageStyles.durationSelector}>
            {durations.map((duration) => (
              <Button
                key={duration.id}
                sx={{
                  ...pageStyles.durationButton,
                  ...(selectedDuration === duration.id &&
                    pageStyles.activeDurationButton),
                }}
                onClick={() => setSelectedDuration(duration.id)}
              >
                {t(`durations.${duration.label}` as keyof typeof t)}
              </Button>
            ))}
          </Box>
        </Box>

        <Grid container spacing={4} justifyContent="center">
          {packagesData.map((pkg, index) => {
            return (
              <Grid item xs={12} sm={6} lg={4} key={index}>
                <Card
                  sx={getCardStyles(pkg, index)}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <CardContent sx={{ flexGrow: 1, textAlign: "center", p: 3 }}>
                    <Box
                      sx={{ display: "flex", justifyContent: "center", mb: 2 }}
                    >
                      <Avatar sx={getIconStyles(pkg.color)}>{pkg.icon}</Avatar>
                    </Box>

                    {/* Category Title */}
                    <Typography
                      variant="h5"
                      sx={{ fontWeight: 700, color: "#333333", mb: 1 }}
                    >
                      {t(`packages.${pkg.category}.category` as keyof typeof t)}
                    </Typography>

                    {/* Popular Tag */}
                    {pkg.popular &&
                      t(`packages.${pkg.category}.tag` as keyof typeof t) && (
                        <Chip
                          label={t(
                            `packages.${pkg.category}.tag` as keyof typeof t
                          )}
                          size="small"
                          sx={{
                            backgroundColor: alpha("#4db6b2", 0.2),
                            color: "#04715d",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            mb: 2,
                            border: `1px solid ${alpha("#4db6b2", 0.3)}`,
                          }}
                        />
                      )}

                    {/* Pricing */}
                    <Box sx={getPriceStyles()}>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#999999",
                          textDecoration: "line-through",
                          fontSize: "1rem",
                        }}
                      >
                        {t(
                          `packages.${pkg.category}.originalPrice.${selectedDuration}` as keyof typeof t
                        )}
                      </Typography>
                      <Typography
                        variant="h4"
                        sx={{
                          fontWeight: 800,
                          background:
                            "linear-gradient(45deg, #4db6b2, #04715d)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          backgroundClip: "text",
                        }}
                      >
                        {t(
                          `packages.${pkg.category}.price.${selectedDuration}` as keyof typeof t
                        )}
                      </Typography>
                    </Box>

                    {/* Features List */}
                    <Box sx={{ borderTop: "1px solid #e9e9e9", pt: 2 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#666666",
                          mb: 2,
                          textAlign: "center",
                          fontWeight: 500,
                        }}
                      >
                        {t(
                          `packages.${pkg.category}.Follow-up` as keyof typeof t
                        )}
                      </Typography>

                      <List dense sx={{ py: 0, textAlign: "start" }}>
                        {Array.from({ length: pkg.numberOfDetails }).map(
                          (_, i) => {
                            const detailKey = `packages.${pkg.category}.detail${
                              i + 1
                            }`;
                            const detail = t(detailKey as keyof typeof t);
                            if (pkg.numberOfDetails < i) return null;
                            return (
                              <ListItem key={i} sx={{ py: 0.5, px: 0 }}>
                                <ListItemIcon sx={{ minWidth: 32 }}>
                                  <Check size={16} color="#4db6b2" />
                                </ListItemIcon>
                                <ListItemText
                                  primary={detail}
                                  primaryTypographyProps={{
                                    variant: "body2",
                                    sx: {
                                      color: "#555555",
                                      fontSize: "0.875rem",
                                      textAlign: "start",
                                    },
                                  }}
                                />
                              </ListItem>
                            );
                          }
                        )}
                      </List>
                    </Box>
                  </CardContent>

                  <CardActions sx={{ p: 3, pt: 0 }}>
                    <Button
                      variant="contained"
                      sx={getGradientButtonStyles(pkg.popular)}
                    >
                      {t("subscribeButton")}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Container>
    </Box>
  );
};

export default Packages;
