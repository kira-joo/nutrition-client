"use client";
import AppLink from "@/app/components/AppLink/AppLink";
import { Recipe } from "@/app/interfaces/recipes";
import AppRoute from "@/constant/AppRoute.enum";
import { DictionaryFiles } from "@/constant/DictionaryFiles";
import useI18n from "@/hooks/useI18n";
import { Card, CardContent, CardMedia, Typography } from "@mui/material";
import React from "react";

const RecipesCard: React.FC<Recipe> = ({
  image,
  title,
  description,
  foodGroup,
  category,
  id,
}) => {
  const { t } = useI18n(DictionaryFiles.Recipes);

  return (
    <Card
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "90%",
        margin: 2,
      }}
    >
      <CardMedia component="img" height="200" image={image} alt={title} />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography
          variant="h6"
          component="div"
          sx={{ fontWeight: "bold", marginBottom: 1 }}
        >
          <AppLink href={AppRoute.Recipe} params={{ id }}>
            <Typography
              sx={{
                color: "#007B7F",
                "&:hover": {
                  color: "#005B5B",
                },
              }}
              component="span"
              variant="h6"
            >
              {t(title)}
            </Typography>
          </AppLink>
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ marginBottom: 1 }}
        >
          {t(description)}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ marginBottom: 1 }}
        >
          <span style={{ color: "#007B7F", fontWeight: "bold" }}>
            {t("Food group")}:{" "}
          </span>
          {foodGroup.map((group, index) => (
            <span key={index}>
              {t(group)}
              {index < foodGroup.length - 1 ? ", " : ""}
            </span>
          ))}
        </Typography>

        {category && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ marginBottom: 1 }}
          >
            <span style={{ color: "#007B7F", fontWeight: "bold" }}>
              {t("Category")}:{" "}
            </span>
            {t(category)}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default RecipesCard;
