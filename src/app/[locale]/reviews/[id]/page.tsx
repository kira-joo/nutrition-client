"use client"; // مهم لو هنعمل useState و Dialog

import { Box, Button, ImageListItem, Typography } from "@mui/material";

import ImageDialog from "@/app/components/ImageDialog";
import { reviews } from "@/constant/reviews";
import { notFound } from "next/navigation";

const getReviewById = (id: string) => {
  return reviews.find((review) => review.id.toString() === id);
};

export default function ReviewPage({ params }: { params: { id: string } }) {
  const reviewId = params.id;
  const review = getReviewById(reviewId);

  if (!review) {
    notFound();
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box sx={{ padding: 1, display: "flex", justifyContent: "center" }}>
        <ImageListItem
          key={review.id}
          sx={{
            padding: "10px",
            border: "2px solid #000",
            borderRadius: "10px",
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
            transition: "transform 0.3s ease",
            "&:hover": {
              transform: "scale(1.05)",
            },
          }}
        >
          <ImageDialog
            src={review.image}
            alt={review.title}
            width={review.width}
            height={review.height}
            style={{ borderRadius: "10px", objectFit: "cover" }}
          />
        </ImageListItem>
      </Box>

      <Box sx={{ width: "100%" }}>
        <Typography variant="h5" sx={{ textAlign: "center" }}>
          {review.title}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          href={review.url}
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            marginTop: 2,
            width: "50%",
            display: "block",
            textAlign: "center",
            borderRadius: 25,
            mx: "auto",
          }}
        >
          اذهب الي المنشور
        </Button>
      </Box>
    </Box>
  );
}
