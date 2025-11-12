"use client";
import AppLink from "@/app/components/AppLink/AppLink";
import { Recipe } from "@/app/interfaces/recipes";
import AppRoute from "@/constant/AppRoute.enum";
import { DictionaryFiles } from "@/constant/DictionaryFiles";
import useI18n from "@/hooks/useI18n";
import {
  alpha,
  Box,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Typography,
} from "@mui/material";
import React, { useState } from "react";

const RecipesCard: React.FC<Recipe> = ({
  image,
  title,
  description,
  foodGroup,
  category,
  id,
}) => {
  const { t } = useI18n(DictionaryFiles.Recipes);
  const [hovered, setHovered] = useState(false);

  const cardStyles = {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#ffffff",
    border: "1px solid #e0e0e0",
    borderRadius: 3,
    transition: "all 0.3s ease-in-out",
    transform: hovered ? "translateY(-8px)" : "translateY(0)",
    boxShadow: hovered
      ? "0px 12px 24px rgba(77, 182, 178, 0.2)"
      : "0px 2px 8px rgba(0, 0, 0, 0.1)",
    overflow: "hidden",
    "&:hover": {
      transform: "translateY(-8px)",
      boxShadow: "0px 12px 24px rgba(77, 182, 178, 0.2)",
      borderColor: "#4db6b2",
    },
  };

  const imageStyles = {
    height: 250,
    transition: "transform 0.3s ease-in-out",
    transform: hovered ? "scale(1.05)" : "scale(1)",
  };

  return (
    <Card
      sx={cardStyles}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <AppLink href={AppRoute.Recipe} params={{ id }}>
        <Box sx={{ position: "relative", overflow: "hidden" }}>
          <CardMedia
            component="img"
            image={image}
            alt={title}
            sx={imageStyles}
          />
          {category && (
            <Chip
              label={t(category as keyof typeof t)}
              size="small"
              sx={{
                position: "absolute",
                top: 12,
                right: 12,
                backgroundColor: alpha("#4db6b2", 0.9),
                color: "white",
                fontWeight: 600,
                fontSize: "0.7rem",
              }}
            />
          )}
        </Box>
        <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
          <Typography
            variant="h6"
            component="h3"
            sx={{
              fontWeight: 700,
              mb: 1.5,
              color: "#007B7F",
              fontSize: "1.1rem",
              transition: "color 0.3s ease",
              "&:hover": {
                color: "#005B5B",
              },
              minHeight: "3rem",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {t(title)}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 2,
              lineHeight: 1.6,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              minHeight: "3rem",
            }}
          >
            {t(description)}
          </Typography>

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 1 }}>
            {foodGroup.map((group, index) => (
              <Chip
                key={index}
                label={t(group as keyof typeof t)}
                size="small"
                sx={{
                  backgroundColor: alpha("#4db6b2", 0.1),
                  color: "#04715d",
                  fontSize: "0.7rem",
                  fontWeight: 500,
                  border: `1px solid ${alpha("#4db6b2", 0.3)}`,
                }}
              />
            ))}
          </Box>
        </CardContent>
      </AppLink>
    </Card>
  );
};

export default RecipesCard;
