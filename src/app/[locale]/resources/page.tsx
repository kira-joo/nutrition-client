import React from "react";

import { Grid } from "@mui/material";
import ResourceCard from "./resourcesCard";

const resources = [
  {
    image: "https://via.placeholder.com/150",
    title: "Resource Title 1",
    description: "Short description of the resource 1.",
    link: "https://example.com/resource1",
  },
  {
    image: "https://via.placeholder.com/150",
    title: "Resource Title 2",
    description: "Short description of the resource 2.",
    link: "https://example.com/resource2",
  },
  {
    image: "https://via.placeholder.com/150",
    title: "Resource Title 3",
    description: "Short description of the resource 3.",
    link: "https://example.com/resource3",
  },
];

const ResourcePage = () => {
  return (
    <Grid container spacing={2}>
      {resources.map((resource, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <ResourceCard
            image={resource.image}
            title={resource.title}
            description={resource.description}
            link={resource.link}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default ResourcePage;
