// Navbar.tsx
"use client";
import * as React from "react";
import { Container, Toolbar } from "@mui/material";
import MobileNavbar from "./MobileNavbar";
import DesktopNavbar from "./DesktopNavbar";

import MobileBranding from "./MobileBranding";
import Branding from "./DesktobBranding";

export default function Navbar() {
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
}
