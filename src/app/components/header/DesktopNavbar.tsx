// DesktopNavbar.tsx
"use client";
import * as React from "react";
import {
  Box,
  Button,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  Avatar,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { SETTINGS } from "@/app/constant/Settings";
import { PAGES } from "@/app/constant/pages";
import { usePathname } from "next/navigation";

interface DesktopNavbarProps {
  anchorElUser: null | HTMLElement;
  handleSwitchNavMenu: (event: React.MouseEvent<HTMLElement>) => void;
}

export default function DesktopNavbar({
  anchorElUser,
  handleSwitchNavMenu,
}: DesktopNavbarProps) {
  const pathname = usePathname(); // Get the current path

  return (
    <>
      <Box sx={{ ml: 2, flexGrow: 1, display: { xs: "none", md: "flex" } }}>
        {PAGES.map((page) => {
          const isActive = pathname === page.url; // Check if current page matches the URL
          return (
            <Link
              key={page.id}
              href={page.url}
              style={{
                textDecoration: "none",
                color: "inherit", // Inherit color from the Button
              }}
            >
              <Button
                sx={{
                  my: 2,
                  color: isActive ? "#ffffff" : "#000000", // Change color if active
                  display: "flex", // Use flex to align icon and text
                  alignItems: "center", // Vertically align icon and text
                  gap: "8px", // Add some space between icon and text
                  transition: "color 0.3s ease, background 0.3s ease", // Smooth transition
                  backgroundColor: isActive ? "#007B7F" : "transparent", // Highlight active button
                  "&:hover": {
                    backgroundColor: isActive ? "#007B7F" : "#66b2a0", // Highlight on hover if active
                    color: isActive ? "#ffffff" : "yellow", // Change text color on hover
                  },
                }}
              >
                {page.title}
              </Button>
            </Link>
          );
        })}
      </Box>

      <Box sx={{ flexGrow: 0 }}>
        <Tooltip title="Open settings">
          <IconButton onClick={handleSwitchNavMenu} sx={{ p: 0 }}>
            <Avatar alt="User" src="/favicon.ico" />
          </IconButton>
        </Tooltip>
        <Menu
          sx={{ mt: "45px" }}
          id="menu-appbar"
          anchorEl={anchorElUser}
          anchorOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          keepMounted
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          open={Boolean(anchorElUser)}
          onClose={handleSwitchNavMenu}
        >
          {SETTINGS.map((setting, index) => {
            const isActive = pathname === setting.url; // Check if current path matches the setting URL
            return (
              <Link
                key={index}
                href={setting.url}
                style={{
                  textDecoration: "none",
                  color: "inherit", // Inherit color from MenuItem
                }}
              >
                <MenuItem
                  onMouseEnter={(e: {
                    currentTarget: { style: { color: string } };
                  }) => {
                    e.currentTarget.style.color = "#007B7F"; // Change to link color on hover
                  }}
                  onMouseLeave={(e: {
                    currentTarget: { style: { color: string } };
                  }) => {
                    e.currentTarget.style.color = "#333333"; // Return to default color on mouse leave
                  }}
                  onClick={handleSwitchNavMenu}
                  sx={{
                    display: "flex",
                    alignItems: "center", // Ensure the icon and title are aligned
                    gap: "10px", // Add some space between the icon and the title
                    color: isActive ? "#007B7F" : "#333333", // Highlight active menu item
                    backgroundColor: isActive ? "#f0f0f0" : "transparent", // Background highlight for active item
                    transition: "color 0.3s ease", // Smooth transition for color
                  }}
                >
                  {setting.icon} {/* Render the icon */}
                  <Typography sx={{ textAlign: "center" }}>
                    {setting.title}
                  </Typography>
                </MenuItem>
              </Link>
            );
          })}
        </Menu>
      </Box>
    </>
  );
}
