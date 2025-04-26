import { FooterMenulist } from "@/app/components/Footer/constant/menu";
import { Box, Grid, Link, Typography } from "@mui/material";

function FooterMenu() {
  return (
    <Grid
      item
      xs={12}
      md={4}
      sx={{ textAlign: "center" }} // Center the title text
    >
      <Box sx={{ marginBottom: "20px" }}>
        <Typography variant="h5" sx={{ color: "#04715d" }}>
          Menu
        </Typography>
        <Box
          sx={{
            width: "40%", // Adjust the width of the underline
            height: "4px", // Adjust the height of the underline
            backgroundColor: "#04715d", // Color of the underline
            margin: "0 auto", // Center the underline
            borderRadius: "2px", // Optional: rounded corners for the underline
          }}
        />
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "start",
          ml: { md: 18, xs: 0 },
        }}
      >
        {FooterMenulist.map(({ icon, label, href }, index) => (
          <Link
            key={index}
            href={href}
            sx={{
              textDecoration: "none",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              mb: 0.5,
              gap: 2,
              transition: "all 0.3s ease", // Smooth transition for hover effect
              padding: "4px 8px", // Smaller padding
              borderRadius: "4px", // Rounded corners for the hover effect
              "&:hover": {
                backgroundColor: "#00796b", // Dark teal for better contrast
                transform: "scale(1.02)", // Slightly scale up on hover
                boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.2)", // Subtle shadow on hover
              },
            }}
          >
            {icon} {label}
          </Link>
        ))}
      </Box>
    </Grid>
  );
}

export default FooterMenu;
