"use client";
import AppLink from "@/app/components/AppLink/AppLink";
import AppRoute from "@/constant/AppRoute.enum";
import { DictionaryFiles } from "@/constant/DictionaryFiles";
import { reviews } from "@/constant/reviews";
import { videos } from "@/constant/videos";
import useI18n from "@/hooks/useI18n";
import { useRTL } from "@/hooks/useRTL";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import {
  alpha,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Rating,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Image from "next/image";
import Faq from "./faq/page";
import Packages from "./packages/page";
import SendMessage from "./send-message/page";

const HomePage = () => {
  const { t } = useI18n(DictionaryFiles.Home);
  const { isRTL, getPosition, getOppositePosition } = useRTL();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const latestReviews = isMobile ? reviews.slice(0, 2) : reviews.slice(0, 3);
  const latestVideos = isMobile ? videos.slice(0, 2) : videos.slice(0, 4);
  return (
    <>
      {/* Hero Section */}
      <Box
        sx={{
          position: "relative",
          width: "100%",
          maxWidth: "100vw",
          minHeight: { xs: "600px", md: "700px" },
          background: `linear-gradient(135deg, ${alpha(
            "#4db6b2",
            0.1
          )} 0%, ${alpha("#007B7F", 0.15)} 50%, ${alpha("#04715d", 0.1)} 100%)`,
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          py: { xs: 6, md: 0 },
        }}
      >
        {/* Decorative Shapes */}
        <Box
          sx={{
            position: "absolute",
            top: -100,
            ...getOppositePosition(-100, "auto"),
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${alpha(
              "#4db6b2",
              0.2
            )}, ${alpha("#007B7F", 0.1)})`,
            filter: "blur(80px)",
            zIndex: 0,
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: -150,
            ...getPosition(-150, "auto"),
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${alpha(
              "#04715d",
              0.15
            )}, ${alpha("#4db6b2", 0.1)})`,
            filter: "blur(100px)",
            zIndex: 0,
          }}
        />

        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <Grid
            container
            spacing={4}
            sx={{
              flexDirection: {
                xs: "column-reverse",
                md: isRTL ? "row-reverse" : "row",
              },
              alignItems: "center",
            }}
          >
            <Grid
              item
              xs={12}
              md={6}
              sx={{
                order: { md: isRTL ? 2 : 1 },
              }}
            >
              <Box
                sx={{
                  textAlign: { xs: "center", md: isRTL ? "right" : "left" },
                  pr: { md: isRTL ? 2 : 4 },
                  pl: { md: isRTL ? 4 : 2 },
                }}
              >
                <Typography
                  variant="h2"
                  component="h1"
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: "2.5rem", md: "3.5rem", lg: "4rem" },
                    lineHeight: 1.2,
                    mb: 3,
                    background: "linear-gradient(45deg, #007B7F, #4db6b2)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {t("heroTitle")}
                </Typography>
                <Typography
                  variant="h6"
                  component="p"
                  sx={{
                    color: "text.secondary",
                    mb: 4,
                    fontSize: { xs: "1rem", md: "1.25rem" },
                    lineHeight: 1.6,
                  }}
                >
                  {t("heroSubtitle")}
                </Typography>
                <AppLink href={AppRoute.Consultation}>
                  <Button
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                      px: 4,
                      py: 1.5,
                      fontSize: "1.1rem",
                      fontWeight: 600,
                      background: "linear-gradient(45deg, #4db6b2, #04715d)",
                      boxShadow: `0 8px 20px ${alpha("#4db6b2", 0.4)}`,
                      "&:hover": {
                        background: "linear-gradient(45deg, #04715d, #00796b)",
                        boxShadow: `0 12px 24px ${alpha("#4db6b2", 0.5)}`,
                        transform: "translateY(-2px)",
                      },
                      transition: "all 0.3s ease",
                    }}
                  >
                    {t("heroCTA")}
                  </Button>
                </AppLink>
              </Box>
            </Grid>

            {/* Personal Image - Right in EN, Left in AR */}
            <Grid item xs={12} md={6} sx={{ order: { md: 1 } }}>
              <Box
                sx={{
                  position: "relative",
                  display: "flex",
                  justifyContent: { xs: "center", md: "flex-end" },
                  alignItems: "center",
                }}
              >
                <Box
                  sx={{
                    position: "relative",
                    width: { xs: "280px", md: "400px", lg: "450px" },
                    height: { xs: "350px", md: "500px", lg: "560px" },
                    borderRadius: 4,
                    overflow: "hidden",
                    boxShadow: `0 20px 60px ${alpha("#007B7F", 0.3)}`,
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: 20,
                      ...getPosition(-20, "auto"),
                      width: "calc(100% + 20px)",
                      height: "100%",
                      borderRadius: 4,
                      background: "linear-gradient(135deg, #4db6b2, #04715d)",
                      zIndex: -1,
                      opacity: 0.2,
                    },
                  }}
                >
                  <Image
                    src="/images/personal.jpeg"
                    alt="Dr. Omnia Ahmed"
                    fill
                    style={{
                      objectFit: "cover",
                      borderRadius: "16px",
                    }}
                    priority
                  />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Why Choose Our Programs Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Typography
          variant="h4"
          component="h2"
          sx={{
            fontWeight: 700,
            color: "#007B7F",
            textAlign: "center",
            mb: 6,
            fontSize: { xs: "1.75rem", md: "2.5rem" },
          }}
        >
          {t("whyChooseTitle")}
        </Typography>
        <Grid container spacing={4}>
          {[
            {
              icon: RestaurantMenuIcon,
              title: t("benefit1Title"),
              desc: t("benefit1Description"),
              delay: 0,
            },
            {
              icon: LocalHospitalIcon,
              title: t("benefit2Title"),
              desc: t("benefit2Description"),
              delay: 0.1,
            },
            {
              icon: CheckCircleIcon,
              title: t("benefit3Title"),
              desc: t("benefit3Description"),
              delay: 0.2,
            },
          ].map((benefit, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card
                sx={{
                  height: "100%",
                  p: 4,
                  boxShadow: `0 4px 20px ${alpha("#007B7F", 0.1)}`,
                  borderRadius: 3,
                  border: `1px solid ${alpha("#4db6b2", 0.2)}`,
                  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  position: "relative",
                  overflow: "visible",
                  ...(index === 1 && {
                    transform: { xs: "none", md: "translateY(20px)" },
                  }),
                  "&:hover": {
                    transform:
                      index === 1
                        ? { xs: "translateY(-12px)", md: "translateY(10px)" }
                        : "translateY(-12px)",
                    boxShadow: `0 12px 40px ${alpha("#4db6b2", 0.25)}`,
                    borderColor: alpha("#4db6b2", 0.4),
                  },
                }}
              >
                <CardContent sx={{ p: 0 }}>
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #4db6b2, #04715d)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: 3,
                      boxShadow: `0 8px 24px ${alpha("#4db6b2", 0.3)}`,
                      transition: "all 0.4s ease",
                      "&:hover": {
                        transform: "scale(1.1) rotate(5deg)",
                        boxShadow: `0 12px 32px ${alpha("#4db6b2", 0.4)}`,
                      },
                    }}
                  >
                    <benefit.icon
                      sx={{
                        fontSize: 40,
                        color: "white",
                      }}
                    />
                  </Box>
                  <Typography
                    variant="h6"
                    component="h3"
                    sx={{
                      fontWeight: 700,
                      color: "#007B7F",
                      mb: 2,
                      fontSize: "1.25rem",
                    }}
                  >
                    {benefit.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      lineHeight: 1.7,
                      fontSize: "0.95rem",
                    }}
                  >
                    {benefit.desc}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Send Message Section */}
      <Box
        sx={{
          py: { xs: 6, md: 8 },
          background: `linear-gradient(135deg, ${alpha(
            "#ffffff",
            0.8
          )}, ${alpha("#f5f5f5", 0.5)})`,
          position: "relative",
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: 3,
              background: "white",
              boxShadow: `0 8px 32px ${alpha("#007B7F", 0.1)}`,
            }}
          >
            <SendMessage />
          </Box>
        </Container>
      </Box>

      {/* Packages Section */}
      <Packages />

      {/* Videos Section */}
      <Box
        sx={{
          py: { xs: 6, md: 10 },
          background: `linear-gradient(135deg, ${alpha(
            "#ffffff",
            0.8
          )}, ${alpha("#f5f5f5", 0.5)})`,
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: 6 }}>
            <Typography
              variant="h4"
              component="h2"
              sx={{
                fontWeight: 700,
                color: "#007B7F",
                mb: 2,
                fontSize: { xs: "1.75rem", md: "2.5rem" },
              }}
            >
              {t("videosTitle")}
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                fontSize: { xs: "0.95rem", md: "1.1rem" },
                maxWidth: "600px",
                mx: "auto",
              }}
            >
              {t("videosSubtitle")}
            </Typography>
          </Box>
          <Grid container spacing={4} sx={{ mb: 6 }}>
            {latestVideos.map((video) => (
              <Grid item xs={12} sm={6} md={3} key={video.id}>
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
                      "&:hover": {
                        transform: "translateY(-8px)",
                        boxShadow: `0 12px 40px ${alpha("#4db6b2", 0.25)}`,
                        borderColor: alpha("#4db6b2", 0.3),
                        "& .play-icon": {
                          transform: "scale(1.2)",
                          opacity: 1,
                        },
                        "& .video-overlay": {
                          opacity: 0.3,
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
                          height: { xs: "200px", md: "220px" },
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
                    <CardContent sx={{ p: 2 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 600,
                          color: "#007B7F",
                          textAlign: "center",
                          fontSize: "0.95rem",
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
          <Box sx={{ textAlign: "center" }}>
            <AppLink href={AppRoute.Videos}>
              <Button
                variant="contained"
                size="large"
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  background: "linear-gradient(45deg, #4db6b2, #04715d)",
                  boxShadow: `0 8px 20px ${alpha("#4db6b2", 0.3)}`,
                  "&:hover": {
                    background: "linear-gradient(45deg, #04715d, #00796b)",
                    boxShadow: `0 12px 24px ${alpha("#4db6b2", 0.4)}`,
                    transform: "translateY(-2px)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                {t("viewAllVideos")}
              </Button>
            </AppLink>
          </Box>
        </Container>
      </Box>

      {/* Reviews Preview Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Typography
          variant="h4"
          component="h2"
          sx={{
            fontWeight: 700,
            color: "#007B7F",
            textAlign: "center",
            mb: 6,
            fontSize: { xs: "1.75rem", md: "2.5rem" },
          }}
        >
          {t("whatOurClientsSay")}
        </Typography>
        <Grid container spacing={4} sx={{ mb: 6 }}>
          {latestReviews.map((review) => (
            <Grid item xs={12} md={4} key={review.id}>
              <AppLink href={AppRoute.Review} params={{ id: review.id }}>
                <Card
                  sx={{
                    height: "100%",
                    p: 3,
                    boxShadow: `0 4px 20px ${alpha("#007B7F", 0.1)}`,
                    borderRadius: 3,
                    display: "flex",
                    flexDirection: "column",
                    border: `1px solid ${alpha("#4db6b2", 0.1)}`,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-8px)",
                      boxShadow: `0 12px 40px ${alpha("#4db6b2", 0.2)}`,
                      borderColor: alpha("#4db6b2", 0.3),
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mb: 2,
                      flexDirection: isRTL ? "row-reverse" : "row",
                    }}
                  >
                    <Avatar
                      src={review.image}
                      alt={`Client ${review.id}`}
                      sx={{
                        width: 80,
                        height: 80,
                        ...getPosition(2, "auto"),
                        border: `3px solid ${alpha("#4db6b2", 0.3)}`,
                      }}
                    />
                    <Box
                      sx={{ flexGrow: 1, textAlign: isRTL ? "right" : "left" }}
                    >
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 600,
                          color: "#007B7F",
                          mb: 0.5,
                        }}
                      >
                        {`Client ${review.id}`}
                      </Typography>
                      <Rating value={5} readOnly size="small" />
                    </Box>
                  </Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      flexGrow: 1,
                      lineHeight: 1.7,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 4,
                      WebkitBoxOrient: "vertical",
                      textAlign: isRTL ? "right" : "left",
                      direction: isRTL ? "rtl" : "ltr",
                    }}
                  >
                    {review.title.length > 100
                      ? `${review.title.substring(0, 100)}...`
                      : review.title}
                  </Typography>
                </Card>
              </AppLink>
            </Grid>
          ))}
        </Grid>
        <Box sx={{ textAlign: "center" }}>
          <AppLink href={AppRoute.Reviews}>
            <Button
              variant="contained"
              size="large"
              sx={{
                px: 4,
                py: 1.5,
                fontSize: "1.1rem",
                fontWeight: 600,
                background: "linear-gradient(45deg, #4db6b2, #04715d)",
                boxShadow: `0 8px 20px ${alpha("#4db6b2", 0.3)}`,
                "&:hover": {
                  background: "linear-gradient(45deg, #04715d, #00796b)",
                  boxShadow: `0 12px 24px ${alpha("#4db6b2", 0.4)}`,
                  transform: "translateY(-2px)",
                },
                transition: "all 0.3s ease",
              }}
            >
              {t("viewAllReviews")}
            </Button>
          </AppLink>
        </Box>
      </Container>

      {/* FAQ Section */}
      <Box
        sx={{
          py: { xs: 6, md: 8 },
          background: `linear-gradient(135deg, ${alpha(
            "#f5f5f5",
            0.5
          )}, ${alpha("#ffffff", 0.8)})`,
        }}
      >
        <Container maxWidth="lg">
          <Faq />
        </Container>
      </Box>
    </>
  );
};
export default HomePage;
