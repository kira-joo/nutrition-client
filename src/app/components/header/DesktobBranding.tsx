import AppRoute from "@/constant/AppRoute.enum";
import { Name } from "@/constant/name";
import { Box } from "@mui/material";
import Image from "next/image";
import Link from "next/link";

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
        <Link href={AppRoute.Home} passHref>
          <Image
            src="/images/leftLogo.png" // Replace with the path to your logo
            alt={Name.NavProfile}
            width={150} // Adjust based on the size of your logo
            height={50} // Adjust based on the size of your logo
          />
        </Link>
      </Box>
    </Box>
  );
};

export default Branding;
