"use client";
import { DictionaryFiles } from "@/constant/DictionaryFiles";
import { videos } from "@/constant/videos";
import useI18n from "@/hooks/useI18n";
import { Box, Button, Typography } from "@mui/material";
import { notFound } from "next/navigation";

const getVideoById = (id: string) => {
  return videos.find((video) => video.id.toString() === id);
};

const VideoPage = ({ params }: { params: { id: string } }) => {
  const videoId = params.id;
  const video = getVideoById(videoId);

  if (!video) {
    notFound();
  }
  const { t } = useI18n(DictionaryFiles.Home);
  return (
    <Box sx={{ textAlign: "center" }}>
      <Typography sx={{ color: "black", marginBottom: "20px" }} variant="h5">
        {t(`videos.${video.id}` as keyof typeof t)}
      </Typography>
      <video
        width="300"
        height="600"
        controls
        style={{ borderRadius: "10px", objectFit: "cover" }}
      >
        <source src={video.source} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <Box sx={{ marginTop: "20px" }}>
        <Button
          variant="contained"
          color="primary"
          href={video.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          {t("videos.GotoTheReel")}
        </Button>
      </Box>
    </Box>
  );
};
export default VideoPage;
