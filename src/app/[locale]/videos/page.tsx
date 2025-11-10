import AppLink from "@/app/components/AppLink/AppLink";
import AppRoute from "@/constant/AppRoute.enum";
import { DictionaryFiles } from "@/constant/DictionaryFiles";
import { videos } from "@/constant/videos";
import useI18n from "@/hooks/useI18n";
import { Box, ImageList, ImageListItem, Typography } from "@mui/material";
const Videos = () => {
  const { t } = useI18n(DictionaryFiles.Home);
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
            height: "8px",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "#4db6b2",
            borderRadius: "10px",
          },
          "&::-webkit-scrollbar-track": {
            background: "#e3f4f1",
          },
        }}
      >
        {videos.map((video, i) => (
          <ImageListItem
            key={i}
            sx={{
              minWidth: 300,
              padding: "10px",
              border: "2px solid #4db6b2",
              borderRadius: "10px",
              boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
              backgroundColor: "#f0f0f0",
              transition: "transform 0.3s ease",
              "&:hover": {
                transform: "scale(1.02)",
                boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.15)",
              },
            }}
          >
            <AppLink
              style={{ color: "#333333" }}
              href={AppRoute.Video}
              params={{ id: video.id }}
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
                  color: "#333333",
                }}
              >
                {t(`videos.${video.id}` as keyof typeof t)}
              </Typography>
            </AppLink>
          </ImageListItem>
        ))}
      </ImageList>
    </Box>
  );
};
export default Videos;
