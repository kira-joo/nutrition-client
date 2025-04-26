// app/videos/[id]/page.tsx
import { videos } from "@/app/constant/videos";
import { Box, Button, Typography } from "@mui/material";
import { notFound } from "next/navigation";

// Fetches data for the specific `id`
const getVideoById = (id: string) => {
  return videos.find((video) => video.id.toString() === id);
};

export default async function VideoPage({
  params,
}: {
  params: { id: string };
}) {
  const videoId = params.id; // Get the id from params
  const video = getVideoById(videoId); // Find the video by id

  if (!video) {
    notFound(); // Handle not found case
  }

  return (
    <Box sx={{ textAlign: "center" }}>
      <Typography sx={{ color: "white" }} variant="h4" gutterBottom>
        {video.title}
      </Typography>
      <video
        width="300" // Adjust width as necessary
        height="600" // Adjust height as necessary
        controls
        style={{
          borderRadius: "10px",
          objectFit: "cover",
        }}
      >
        <source src={video.source} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <Box sx={{ marginTop: "20px" }}>
        <Button
          variant="contained"
          color="primary"
          href={video.url} // Replace with the appropriate URL for the Facebook reel
          target="_blank"
          rel="noopener noreferrer"
        >
          Go to The Reel
        </Button>
      </Box>
    </Box>
  );
}
