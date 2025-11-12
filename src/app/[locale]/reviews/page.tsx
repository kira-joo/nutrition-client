"use client";
import AppLink from "@/app/components/AppLink/AppLink";
import AppRoute from "@/constant/AppRoute.enum";
import { reviews } from "@/constant/reviews";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Container,
  Grid,
  Rating,
  Typography,
} from "@mui/material";

const Reviews = () => {
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
        }}
      >
        Reviews
      </Typography>
      <Grid container spacing={4}>
        {reviews.map((review) => (
          <Grid item xs={12} md={4} key={review.id}>
            <AppLink
              href={AppRoute.Review}
              params={{ id: review.id }}
              style={{ textDecoration: "none" }}
            >
              <Card
                sx={{
                  height: "100%",
                  p: 3,
                  boxShadow: 3,
                  borderRadius: 2,
                  display: "flex",
                  flexDirection: "column",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: 6,
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1, p: 0 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <Avatar
                      src={review.image}
                      alt={`Client ${review.id}`}
                      sx={{ width: 80, height: 80, mr: 2 }}
                    />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 600, color: "#007B7F", mb: 0.5 }}
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
                      lineHeight: 1.6,
                      color: "#333",
                    }}
                  >
                    {review.title}
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
export default Reviews;
