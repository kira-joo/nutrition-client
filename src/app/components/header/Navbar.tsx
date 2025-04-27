// Navbar.tsx
"use client";
import { Container, Toolbar } from "@mui/material";
import * as React from "react";
import DesktopNavbar from "./DesktopNavbar";
import MobileNavbar from "./MobileNavbar";

import Branding from "./DesktobBranding";
import MobileBranding from "./MobileBranding";

const Navbar = () => {
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(
    null
  );

  const handleSwitchUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    if (!anchorElUser) {
      setAnchorElUser(event.currentTarget);
    } else {
      setAnchorElUser(null);
    }
  };

  return (
    <Container maxWidth="xl">
      <Toolbar disableGutters>
        <MobileNavbar />
        <MobileBranding />
        <Branding />
        <DesktopNavbar
          anchorElUser={anchorElUser}
          handleSwitchNavMenu={handleSwitchUserMenu}
        />
      </Toolbar>
    </Container>
  );
};
export default Navbar;
