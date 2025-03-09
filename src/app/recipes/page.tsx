import React from "react";

import { Container, Grid } from "@mui/material";
import { RESOURCES } from "./RECIPES";
import ResourceCard from "./RecipesCard";

function Recipes() {
  return (
    <Container>
      <Grid container spacing={2}>
        {RESOURCES.map((resource, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <ResourceCard
              image={resource.image}
              title={resource.title}
              description={resource.description}
              category={resource.Category}
              foodGroup={resource.Food_group}
              id={resource.id}
            />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default Recipes;
