import { SocialMediaLinks } from "@/app/components/Footer/constant/socialMediaLinks";
import { Box, Grid, IconButton, Tooltip, Typography } from "@mui/material";

function FooterSocialMedia() {
  return (
    <Grid
      item
      xs={12}
      md={4}
      sx={{
        mt: { md: 3, sx: 8 },
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <Typography
        variant="subtitle1"
        sx={{ color: "#ffffff", mb: 1, fontWeight: 600 }}
      >
        Connect with me
      </Typography>
      <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
        {SocialMediaLinks.map(({ icon, color, href, name }, index) => (
          <Tooltip title={name} key={index}>
            <IconButton
              key={index}
              component="a"
              href={href}
              target="_blank"
              sx={{ color }}
            >
              {icon}
            </IconButton>
          </Tooltip>
        ))}
      </Box>
    </Grid>
  );
}

export default FooterSocialMedia;
