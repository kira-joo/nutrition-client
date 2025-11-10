// Navbar.tsx
"use client";
import { Container, Toolbar } from "@mui/material";
import Branding from "./DesktobBranding";
import DesktopNavbar from "./DesktopNavbar";
import MobileNavbar from "./MobileNavbar";

const Navbar = () => {
  return (
    <Container maxWidth="xl">
      <Toolbar
        disableGutters
        sx={{ justifyContent: "space-between", px: { xs: 0, md: 0 } }}
      >
        {/* Mobile menu */}
        <MobileNavbar />
        {/* Mobile Branding */}
        {/* <MobileBranding /> */}
        {/* branding */}
        <Branding />
        {/* Desktop menu */}
        <DesktopNavbar />
      </Toolbar>
    </Container>
  );
};
export default Navbar;
