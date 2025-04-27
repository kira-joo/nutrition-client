import { Container, Grid } from "@mui/material";

import { RecipesList } from "@/constant/recipes";
import RecipesCard from "./RecipesCard";

const Recipes = () => {
  return (
    <Container>
      <Grid container spacing={2}>
        {RecipesList.map((resource, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
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
  );
};

export default Recipes;
