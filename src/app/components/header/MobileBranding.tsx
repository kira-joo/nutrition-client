import AppRoute from "@/constant/AppRoute.enum";
import { Name } from "@/constant/name";
import { Box } from "@mui/material"; // Import Box from MUI
import Image from "next/image";
import AppLink from "../AppLink/AppLink";

const MobileBranding = () => {
  return (
    <Box sx={{ display: { xs: "flex", md: "none" }, flexGrow: 1 }}>
      <AppLink href={AppRoute.Home}>
        <Image
          src="/images/leftLogo.png"
          alt={Name.NavProfile}
          width={150}
          height={50}
        />
      </AppLink>
    </Box>
  );
};

export default MobileBranding;
