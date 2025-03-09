import Image from "next/image";
import { Box, Typography, Button, ImageListItem } from "@mui/material";
import { REVIEWS } from "@/app/constant/data";
import { notFound } from "next/navigation";

// Fetches data for the specific `id`
const getReviewById = (id: string) => {
  return REVIEWS.find((review) => review.id.toString() === id);
};

export default async function ReviewPage({
  params,
}: {
  params: { id: string };
}) {
  const reviewId = params.id; // Get the id from params
  const review = getReviewById(reviewId); // Find the review by id

  if (!review) {
    notFound(); // Handle not found case
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column", // Default layout for mobile (centered)
        gap: 2, // Add some spacing between elements
        alignItems: "center", // Center elements horizontally on mobile
        justifyContent: "center", // Center elements vertically on mobile
      }}
    >
      <Box
        sx={{
          padding: 1,
          display: "flex",
          justifyContent: "center",
        }}
      >
        {" "}
        {/* Image container */}
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
          <Image
            src={review.image}
            alt={review.title}
            width={315}
            height={460}
            priority
            style={{
              borderRadius: "10px",
              border: "2px solid ",
              objectFit: "cover",
            }}
          />
        </ImageListItem>
      </Box>
      <Box sx={{ width: "100%" }}>
        {/* Content container */}
        <Typography variant="h4" gutterBottom dir="rtl">
          {/* Add dir="rtl" */}
          {review.title}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          href={review.url}
          target="_blank"
          rel="noopener noreferrer"
          sx={{ marginTop: 2, width: "100%" }}
        >
          Go to the post
        </Button>
      </Box>
    </Box>
  );
}
