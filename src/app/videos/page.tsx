import React from "react";
import { Box, ImageList, ImageListItem, Typography } from "@mui/material";
import Link from "next/link";
import { VIDEOS } from "../constant/data";

export default function Videos() {
  return (
    <Box sx={{ display: "flex", justifyContent: "center" }}>
      <ImageList
        sx={{
          display: "flex",
          gap: 30,
          overflowX: "scroll",
          whiteSpace: "nowrap",
          padding: 2,
          scrollBehavior: "smooth",
          "&::-webkit-scrollbar": {
            // Custom scrollbar styling
            height: "8px",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "#4db6b2", // Match the navbar and footer colors
            borderRadius: "10px",
          },
          "&::-webkit-scrollbar-track": {
            background: "#e3f4f1", // Match the background color
          },
        }}
      >
        {VIDEOS.map((video) => (
          <ImageListItem
            key={video.id}
            sx={{
              minWidth: 300,
              padding: "10px",
              border: "2px solid #4db6b2", // Match footer and navbar colors
              borderRadius: "10px",
              boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
              backgroundColor: "#f0f0f0", // A lighter background for contrast
              transition: "transform 0.3s ease",
              "&:hover": {
                transform: "scale(1.02)",
                boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.15)", // Enhance shadow on hover
              },
            }}
          >
            <Link
              style={{ color: "#333333", textDecoration: "none" }} // Change text color to dark gray for contrast
              href={`/videos/${video.id}`} // Use backticks here
              passHref
            >
              <video
                width="300"
                height="250"
                style={{
                  borderRadius: "5px",
                  objectFit: "cover",
                }}
                controls
              >
                <source src={video.source} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <Typography
                variant="subtitle1"
                sx={{
                  marginTop: 1,
                  textAlign: "center",
                  color: "#333333", // Ensure the text is legible
                }}
              >
                {video.title}
              </Typography>
            </Link>
          </ImageListItem>
        ))}
      </ImageList>
    </Box>
  );
}
