import { Box } from "@mui/material";
import Image from "next/image";

function ImageN() {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "flex-start", // Align the image to the left
        alignItems: "center",
        position: "relative",
        width: "100%", // Full width
        height: "auto", // Let height adjust
        maxHeight: "500px", // Limit image height
        mb: 4, // Margin bottom before FAQ
        overflow: "hidden", // Prevent overflow issues
      }}
    >
      <Image
        src="/images/nice.png" // Replace with your image path
        alt="Business overview"
        layout="responsive"
        width={2400} // Image width
        height={500} // Image height
        objectFit="cover" // Ensure the image covers the area
        objectPosition="top" // Display the top part of the image
        priority // Prioritize loading the image
      />
    </Box>
  );
}

export default ImageN;
