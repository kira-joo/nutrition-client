"use client";
import { DictionaryFiles } from "@/constant/DictionaryFiles";
import { Locale } from "@/constant/Locale.enum";
import { RecipesList } from "@/constant/recipes";
import useI18n from "@/hooks/useI18n";
import { useMessages } from "next-intl";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PeopleIcon from "@mui/icons-material/People";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import {
  Box,
  Card,
  CardMedia,
  Chip,
  Container,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import { notFound, useParams } from "next/navigation";

// Map recipe IDs to recipe keys
const recipeKeyMap: { [key: number]: string } = {
  1: "healthy_koshary",
  2: "molokhia_with_grilled_chicken",
  3: "stuffed_zucchini_light",
  4: "bamia_with_olive_oil",
  5: "grilled_fish_with_tahini",
  6: "light_lentil_soup",
  7: "light_potato_tagine",
  8: "diet_grape_leaves",
  9: "diet_tuna_salad",
  10: "diet_vegetable_omelette",
  11: "diet_baked_potatoes",
  12: "diet_banana_oat_smoothie",
  13: "diet_cottage_cheese_avocado_sandwich",
  14: "diet_yogurt_cucumber_salad",
  15: "diet_grilled_chicken_lemon",
};

const getRecipeById = (id: string) => {
  const recipeId = parseInt(id);
  return RecipesList.find((recipe) => recipe.id === recipeId);
};

const RecipeDetailPage = () => {
  const { id } = useParams();
  const recipe = getRecipeById(id as string);
  const { t } = useI18n(DictionaryFiles.Recipes);
  const { locale } = useParams();
  const messages = useMessages();

  if (!recipe) {
    notFound();
  }

  const recipeKey = recipeKeyMap[recipe.id];
  if (!recipeKey) {
    notFound();
  }

  const recipeTitle = t(`recipes.${recipeKey}.title` as Parameters<typeof t>[0]);
  const recipeDescription = t(
    `recipes.${recipeKey}.description` as Parameters<typeof t>[0]
  );
  const prepTime = t(`recipes.${recipeKey}.prepTime` as Parameters<typeof t>[0]);
  const cookTime = t(`recipes.${recipeKey}.cookTime` as Parameters<typeof t>[0]);
  const servings = t(`recipes.${recipeKey}.servings` as Parameters<typeof t>[0]);

  // Ingredients/instructions aren't looked up through t() (their keys are
  // built dynamically per recipe) — read them straight from the current
  // locale's already-loaded messages tree instead, replacing the old
  // i18next `getResourceBundle` call.
  const recipesNamespace = messages[DictionaryFiles.Recipes] as {
    recipes?: Record<string, { ingredients?: string[]; instructions?: string[] }>;
  };
  const recipeData = recipesNamespace?.recipes?.[recipeKey];
  const ingredients = recipeData?.ingredients || [];
  const instructions = recipeData?.instructions || [];
  const isRTL = locale === Locale.AR; // Keep for numbered box margin adjustment

  return (
    <Container
      maxWidth="lg"
      sx={{
        py: 4,
        px: { xs: 2, sm: 3, md: 4 },
      }}
    >
      <Grid
        container
        spacing={{ xs: 2, sm: 3, md: 4 }}
        justifyContent={{ xs: "center", md: "flex-start" }}
      >
        {/* Recipe Image */}
        <Grid item xs={12} sm={10} md={6}>
          <Card
            sx={{
              height: "100%",
              boxShadow: 3,
              borderRadius: 2,
              overflow: "hidden",
              mx: { xs: "auto", md: 0 },
              maxWidth: { xs: "100%", sm: "500px", md: "100%" },
            }}
          >
            <CardMedia
              component="img"
              height="500"
              image={recipe.image}
              alt={recipeTitle}
              sx={{ objectFit: "cover" }}
            />
          </Card>
        </Grid>

        {/* Recipe Info */}
        <Grid item xs={12} sm={10} md={6}>
          <Box
            sx={{
              mb: 3,
              textAlign: { xs: "center" },
            }}
          >
            <Typography
              variant="h3"
              component="h1"
              sx={{ fontWeight: 700, color: "#007B7F", mb: 2 }}
            >
              {recipeTitle}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {recipeDescription}
            </Typography>

            {/* Recipe Meta Info */}
            <Grid
              container
              spacing={2}
              sx={{
                mb: 3,
                justifyContent: { xs: "center", md: "flex-start" },
              }}
            >
              <Grid item xs={4}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    p: 2,
                    backgroundColor: "#f5f5f5",
                    borderRadius: 2,
                  }}
                >
                  <AccessTimeIcon sx={{ color: "#007B7F", mb: 1 }} />
                  <Typography variant="caption" color="text.secondary">
                    {t("PrepTime")}
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {prepTime}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    p: 2,
                    backgroundColor: "#f5f5f5",
                    borderRadius: 2,
                  }}
                >
                  <RestaurantIcon sx={{ color: "#007B7F", mb: 1 }} />
                  <Typography variant="caption" color="text.secondary">
                    {t("CookTime")}
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {cookTime}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    p: 2,
                    backgroundColor: "#f5f5f5",
                    borderRadius: 2,
                  }}
                >
                  <PeopleIcon sx={{ color: "#007B7F", mb: 1 }} />
                  <Typography variant="caption" color="text.secondary">
                    {t("Servings")}
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {servings}
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {/* Category and Food Groups */}
            <Box
              sx={{
                mb: 3,
                display: "flex",
                flexWrap: "wrap",
                justifyContent: { xs: "center", md: "flex-start" },
                gap: 1,
              }}
            >
              {recipe.category && (
                <Chip
                  label={t(recipe.category as Parameters<typeof t>[0])}
                  sx={{
                    backgroundColor: "#4db6b2",
                    color: "white",
                  }}
                />
              )}
              {recipe.foodGroup.map((group, index) => (
                <Chip
                  key={index}
                  label={t(group as Parameters<typeof t>[0])}
                  sx={{
                    backgroundColor: "#04715d",
                    color: "white",
                  }}
                />
              ))}
            </Box>
          </Box>
        </Grid>

        {/* Ingredients Section */}
        <Grid item xs={12} sm={10} md={6}>
          <Card
            sx={{
              p: 3,
              boxShadow: 3,
              borderRadius: 2,
              mx: { xs: "auto", md: 0 },
              maxWidth: { xs: "100%", sm: "500px", md: "100%" },
            }}
          >
            <Typography
              variant="h5"
              component="h2"
              sx={{
                fontWeight: 600,
                color: "#007B7F",
                mb: 2,
                textAlign: { xs: "center", md: "left" },
              }}
            >
              {t("Ingredients")}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <List>
              {Array.isArray(ingredients) &&
                ingredients.map((ingredient: string, index: number) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemText
                      primary={ingredient}
                      primaryTypographyProps={{
                        variant: "body1",
                        sx: { color: "#333" },
                      }}
                    />
                  </ListItem>
                ))}
            </List>
          </Card>
        </Grid>

        {/* Instructions Section */}
        <Grid item xs={12} sm={10} md={6}>
          <Card
            sx={{
              p: 3,
              boxShadow: 3,
              borderRadius: 2,
              mx: { xs: "auto", md: 0 },
              maxWidth: { xs: "100%", sm: "500px", md: "100%" },
            }}
          >
            <Typography
              variant="h5"
              component="h2"
              sx={{
                fontWeight: 600,
                color: "#007B7F",
                mb: 2,
                textAlign: { xs: "center", md: "left" },
              }}
            >
              {t("Instructions")}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <List>
              {Array.isArray(instructions) &&
                instructions.map((instruction: string, index: number) => (
                  <ListItem
                    key={index}
                    sx={{ px: 0, alignItems: "flex-start" }}
                  >
                    <Box
                      sx={{
                        minWidth: 32,
                        height: 32,
                        borderRadius: "50%",
                        backgroundColor: "#007B7F",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "bold",
                        mr: isRTL ? 0 : 2,
                        ml: isRTL ? 2 : 0,
                        mt: 0.5,
                        order: isRTL ? 2 : 1,
                      }}
                    >
                      {index + 1}
                    </Box>
                    <ListItemText
                      primary={instruction}
                      sx={{ order: isRTL ? 1 : 2 }}
                      primaryTypographyProps={{
                        variant: "body1",
                        sx: { color: "#333", lineHeight: 1.6 },
                      }}
                    />
                  </ListItem>
                ))}
            </List>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};
export default RecipeDetailPage;
