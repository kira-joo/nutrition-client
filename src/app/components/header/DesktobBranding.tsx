import { Typography, Box } from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import { Name } from "../../constant/name";

const Branding = () => {
  return (
    <Box
      sx={{
        display: { xs: "none", md: "flex" },

        alignItems: "center", // Align the text and image vertically
      }}
    >
      {/* Logo for medium and larger screens */}
      <Box>
        <Link href="/" passHref>
          <Image
            src="/images/leftLogo.png" // Replace with the path to your logo
            alt={Name.NavProfile}
            width={150} // Adjust based on the size of your logo
            height={50} // Adjust based on the size of your logo
          />
        </Link>
      </Box>

      {/* Branding text for extra-small screens */}
      <Typography
        variant="h6"
        noWrap
        component="div"
        sx={{
          mr: 2,
          display: { xs: "flex", md: "none" }, // Show text on xs and hide on md
          fontFamily: "monospace",
          cursor: "pointer",
          fontWeight: 700,
          letterSpacing: ".3rem",
          color: "inherit",
          textDecoration: "none",
        }}
      >
        <Link
          href="/"
          style={{
            textDecoration: "none",
            color: "green", // Hide default text color
            display: "block",
            background: "#ffffff",
            backgroundClip: "text", // Use this to clip the background to the text
            WebkitBackgroundClip: "text", // For Safari
          }}
        >
          {Name.NavProfile}
        </Link>
      </Typography>
    </Box>
  );
};

export default Branding;
