import AppLink from "@/app/components/AppLink/AppLink";
import AppRoute from "@/constant/AppRoute.enum";
import { reviews } from "@/constant/reviews";
import { Box, ImageList, ImageListItem } from "@mui/material";
import Image from "next/image";

const Reviews = () => {
  return (
    <Box
      flexWrap="wrap"
      justifyContent="center"
      display="flex"
      m="auto"
      sx={{
        display: "flex",
        justifyContent: "center",
        padding: 1,
      }}
    >
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
        {reviews.map((review, i) => (
          <AppLink
            key={i}
            style={{
              color: "#007B7F", // Link Color
              textDecoration: "none",
              justifyContent: "center",
              display: "flex",
            }}
            passHref
            href={AppRoute.Reviews}
            params={{ id: review.id }} // Pass the ID as a parameter
          >
            <ImageListItem
              sx={{
                justifyContent: "center",
                display: "flex",
                minWidth: 300,
                padding: "10px",
                border: "2px solid #66b2a0", // Soft Green
                borderRadius: "10px",
                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                backgroundColor: "#ffffff", // White background for better contrast
                transition: "transform 0.3s ease",
                "&:hover": {
                  transform: "scale(1.01)",
                },
              }}
            >
              <Image
                src={review.image}
                alt={review.title}
                layout="responsive"
                width={300}
                height={160}
                style={{
                  borderRadius: "5px",
                  objectFit: "cover",
                }}
              />
            </ImageListItem>
          </AppLink>
        ))}
      </ImageList>
    </Box>
  );
};
export default Reviews;
