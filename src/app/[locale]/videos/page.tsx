"use client";
import AppLink from "@/app/components/AppLink/AppLink";
import AppRoute from "@/constant/AppRoute.enum";
import { DictionaryFiles } from "@/constant/DictionaryFiles";
import { videos } from "@/constant/videos";
import useI18n from "@/hooks/useI18n";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import {
  alpha,
  Box,
  Card,
  CardContent,
  Container,
  Grid,
  Typography,
} from "@mui/material";

const Videos = () => {
  const { t } = useI18n(DictionaryFiles.Home);

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography
        variant="h4"
        component="h1"
        sx={{
          fontWeight: 700,
          color: "#007B7F",
          textAlign: "center",
          mb: 6,
          fontSize: { xs: "1.75rem", md: "2.5rem" },
        }}
      >
        {t("video")}
      </Typography>
      <Grid container spacing={4}>
        {videos.map((video, index) => (
          <Grid item xs={12} sm={6} md={4} key={`${video.id}-${index}`}>
            <AppLink
              href={AppRoute.Video}
              params={{ id: video.id }}
              style={{ textDecoration: "none" }}
            >
              <Card
                sx={{
                  height: "100%",
                  boxShadow: `0 4px 20px ${alpha("#007B7F", 0.1)}`,
                  borderRadius: 3,
                  overflow: "hidden",
                  border: `1px solid ${alpha("#4db6b2", 0.1)}`,
                  transition: "all 0.3s ease",
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: `0 12px 40px ${alpha("#4db6b2", 0.25)}`,
                    borderColor: alpha("#4db6b2", 0.3),
                    "& .play-icon": {
                      transform: "scale(1.2)",
                      opacity: 1,
                    },
                    "& .video-overlay": {
                      opacity: 0.5,
                    },
                  },
                }}
              >
                <Box sx={{ position: "relative", overflow: "hidden" }}>
                  <Box
                    component="video"
                    src={video.source}
                    sx={{
                      width: "100%",
                      height: { xs: "250px", md: "280px" },
                      objectFit: "cover",
                      backgroundColor: "#000",
                      display: "block",
                    }}
                    muted
                    preload="metadata"
                    playsInline
                  />
                  <Box
                    className="video-overlay"
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: `linear-gradient(135deg, ${alpha(
                        "#007B7F",
                        0.5
                      )}, ${alpha("#4db6b2", 0.3)})`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: 0.4,
                      transition: "opacity 0.3s ease",
                      cursor: "pointer",
                    }}
                  >
                    <PlayCircleOutlineIcon
                      className="play-icon"
                      sx={{
                        fontSize: 64,
                        color: "white",
                        opacity: 0.95,
                        transition: "all 0.3s ease",
                        filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.3))",
                      }}
                    />
                  </Box>
                </Box>
                <CardContent sx={{ p: 2.5, flexGrow: 1 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 600,
                      color: "#007B7F",
                      textAlign: "center",
                      fontSize: "1rem",
                      lineHeight: 1.4,
                    }}
                  >
                    {t(`videos.${video.id}` as keyof typeof t)}
                  </Typography>
                </CardContent>
              </Card>
            </AppLink>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};
export default Videos;
