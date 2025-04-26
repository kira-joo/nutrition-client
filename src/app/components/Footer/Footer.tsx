import { Box, Typography, Grid } from "@mui/material";
import FooterWelcome from "./FooterWelcome";
import FooterSocialMedia from "./FooterSocialMedia";
import FooterMenu from "./FooterMenu";
import { Name } from "../../constant/name"; // Assuming Name contains the business owner's info

function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        background: "#4db6b2",
        borderRadius: 4,
        p: { xs: 3, md: 4 },
        boxShadow: 3,
        textAlign: "center",
        py: 4,
        borderTop: "1px solid #ddd",
        mt: "auto",
      }}
    >
      <Grid container spacing={{ xs: 5, md: 10 }}>
        <FooterWelcome />
        <FooterSocialMedia />
        <FooterMenu />
      </Grid>

      {/* Footer Profile Info */}
      <Typography
        variant="body2"
        color="#ffffff"
        sx={{ textAlign: "center", mt: { xs: 3, md: 0 } }}
      >
        {Name.FooterProfile} {/* Personal/business profile or tagline */}
      </Typography>
    </Box>
  );
}

export default Footer;
