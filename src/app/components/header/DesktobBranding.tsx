import AppRoute from "@/constant/AppRoute.enum";
import { Name } from "@/constant/name";
import { Box } from "@mui/material";
import Image from "next/image";
import AppLink from "../AppLink/AppLink";

const Branding = () => {
  return (
    <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center" }}>
      <Box>
        <AppLink href={AppRoute.Home}>
          <Image
            src="/images/leftLogo.png"
            alt={Name.NavProfile}
            width={150}
            height={50}
          />
        </AppLink>
      </Box>
    </Box>
  );
};

export default Branding;
