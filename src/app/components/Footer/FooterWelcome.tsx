import { Typography, Grid, Box } from "@mui/material";
import Image from "next/image";

function FooterWelcome() {
  return (
    <Grid item xs={12} md={4} sx={{ textAlign: { xs: "center", md: "left" } }}>
      {/* Wrap the Image in a Box to apply MUI styles */}
      <Box
        sx={{
          mb: { xs: 2, md: 4 }, // Margin bottom
          ml: { xs: 0, md: "20px" }, // Left margin only for md and up
        }}
      >
        {/* Logo as an optimized image */}
        <Image
          src="/images/TopLogooooo.png"
          alt="Nutrition Hub Logo"
          width={230} // Set desired width
          height={70} // Set desired height
        />
      </Box>
      <Typography
        variant="subtitle1"
        sx={{
          color: "#ffffff",
          fontWeight: 500,
        }}
      >
        Welcome to my Nutrition Hub! I am dedicated to helping you achieve your
        health and wellness goals. Whether you need personalized advice or
        resources, I&rsquo;m here for you. Reach out anytime for support!
      </Typography>
    </Grid>
  );
}

export default FooterWelcome;
