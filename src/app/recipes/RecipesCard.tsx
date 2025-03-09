import React from "react";
import { Card, CardMedia, CardContent, Typography } from "@mui/material";
import Link from "next/link"; // Import Link from Next.js

interface ResourceCardProps {
  image: string; // URL of the resource image
  title: string; // Title of the resource
  description: string; // Short description of the resource
  foodGroup: string[]; // Required food groups for the resource
  category?: string; // Optional category for the resource
  id: number; // Required ID for the resource link
}

const RecipesCard: React.FC<ResourceCardProps> = ({
  image,
  title,
  description,
  foodGroup,
  category,
  id, // Add id as a required prop
}) => {
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
          <Link
            href={`/recipes/${id}`}
            style={{ textDecoration: "none" }} // Remove default link underline
          >
            <Typography
              sx={{
                color: "#007B7F", // Default link color
                "&:hover": {
                  color: "#005B5B", // Change color on hover
                },
              }}
              component="span" // Use span to ensure proper styling
              variant="h6"
            >
              {title}
            </Typography>
          </Link>
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ marginBottom: 1 }}
        >
          {description}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ marginBottom: 1 }}
        >
          <span style={{ color: "#007B7F", fontWeight: "bold" }}>
            Food group:{" "}
          </span>
          {foodGroup.join(", ")} {/* Display food groups */}
        </Typography>

        {category && ( // Conditionally render the category if it exists
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ marginBottom: 1 }}
          >
            <span style={{ color: "#007B7F", fontWeight: "bold" }}>
              Category:{" "}
            </span>
            {category}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default RecipesCard;
