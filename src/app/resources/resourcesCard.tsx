import React from "react";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
} from "@mui/material";
interface ResourceCardProps {
  image: string; // URL of the resource image
  title: string; // Title of the resource
  description: string; // Short description of the resource
  link: string; // URL to the resource
}

const ResourceCard: React.FC<ResourceCardProps> = ({
  image,
  title,
  description,
  link,
}) => {
  return (
    <Card sx={{ maxWidth: 345, margin: 2 }}>
      <CardMedia component="img" height="140" image={image} alt={title} />
      <CardContent>
        <Typography variant="h6" component="div" sx={{ fontWeight: "bold" }}>
          {title}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ marginBottom: 2 }}
        >
          {description}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          href={link}
          target="_blank"
          rel="noopener noreferrer"
        >
          Go to Resource
        </Button>
      </CardContent>
    </Card>
  );
};

export default ResourceCard;
