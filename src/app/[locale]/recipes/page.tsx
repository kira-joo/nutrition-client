"use client";
import { DictionaryFiles } from "@/constant/DictionaryFiles";
import { RecipesList } from "@/constant/recipes";
import useI18n from "@/hooks/useI18n";
import { Box, Container, Grid, Typography } from "@mui/material";
import RecipesCard from "./RecipesCard";

const Recipes = () => {
  const { t } = useI18n(DictionaryFiles.Recipes);

  const pageStyles = {
    container: {
      backgroundColor: "#ffffff",
      color: "#333333",
      minHeight: "100vh",
      py: { xs: 4, md: 6 },
      px: { xs: 2, sm: 3, lg: 4 },
      background:
        "linear-gradient(135deg, rgba(77, 182, 178, 0.05), rgba(255, 255, 255, 0.1))",
    },
    header: {
      textAlign: "center",
      mb: { xs: 4, md: 6 },
    },
    subtitle: {
      fontSize: "0.875rem",
      color: "#666666",
      mb: 1,
      letterSpacing: "0.05em",
      fontWeight: 600,
      textTransform: "uppercase",
    },
    title: {
      fontSize: { xs: "2rem", sm: "2.5rem", lg: "3.5rem" },
      fontWeight: 800,
      lineHeight: 1.1,
      mb: 2,
      color: "#333333",
    },
    titleAccent: {
      background: "linear-gradient(45deg, #4db6b2, #04715d)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
    },
  };

  return (
    <Box sx={pageStyles.container}>
      <Container maxWidth="xl">
        <Box sx={pageStyles.header}>
          <Typography sx={pageStyles.subtitle}>{t("pageSubtitle")}</Typography>
          <Typography variant="h1" sx={pageStyles.title}>
            {t("pageTitle")}
          </Typography>
        </Box>

        <Grid container spacing={3} justifyContent="center">
          {RecipesList.map((resource, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <RecipesCard
                image={resource.image}
                title={resource.title}
                description={resource.description}
                category={resource.category}
                foodGroup={resource.foodGroup}
                id={resource.id}
              />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Recipes;
