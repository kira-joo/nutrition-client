import Image from "next/image";
import Link from "next/link";
import { Name } from "../../constant/name";
import { Box } from "@mui/material"; // Import Box from MUI

const MobileBranding = () => {
  return (
    <Link href="/">
      <Box
        sx={{
          display: { xs: "flex", md: "none" }, // Display flex on extra-small screens and none on medium and larger screens
          mr: 5,
          flexGrow: 1,
        }}
      >
        <Image
          src="/images/leftLogo.png" // Replace with the path to your logo
          alt={Name.NavProfile}
          width={150} // Adjust based on the size of your logo
          height={50} // Adjust based on the size of your logo
        />
      </Box>
    </Link>
  );
};

export default MobileBranding;
