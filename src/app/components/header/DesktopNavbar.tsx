"use client";
import { DictionaryFiles } from "@/constant/DictionaryFiles";
import { NavigatePages } from "@/constant/navigate-pages";
import { settings } from "@/constant/settings";
import useI18n from "@/hooks/useI18n";
import {
  Avatar,
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

interface DesktopNavbarProps {
  anchorElUser: null | HTMLElement;
  handleSwitchNavMenu: (event: React.MouseEvent<HTMLElement>) => void;
}

const DesktopNavbar = ({
  anchorElUser,
  handleSwitchNavMenu,
}: DesktopNavbarProps) => {
  const pathname = usePathname();
  const { t } = useI18n(DictionaryFiles.Home);
  return (
    <>
      <Box sx={{ ml: 2, flexGrow: 1, display: { xs: "none", md: "flex" } }}>
        {NavigatePages.map((page, i) => {
          const isActive = pathname === page.url;
          return (
            <Link
              key={i}
              href={page.url}
              style={{
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <Button
                sx={{
                  my: 2,
                  color: isActive ? "#ffffff" : "#000000",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: "color 0.3s ease, background 0.3s ease",
                  backgroundColor: isActive ? "#007B7F" : "transparent",
                  "&:hover": {
                    backgroundColor: isActive ? "#007B7F" : "#66b2a0",
                    color: isActive ? "#ffffff" : "yellow",
                  },
                }}
              >
                {t(page.title as keyof typeof t)}
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
          {settings.map((setting, index) => (
            <Link
              key={index}
              href={setting.url}
              style={{
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <MenuItem
                onMouseEnter={(e: {
                  currentTarget: { style: { color: string } };
                }) => {
                  e.currentTarget.style.color = "#007B7F";
                }}
                onMouseLeave={(e: {
                  currentTarget: { style: { color: string } };
                }) => {
                  e.currentTarget.style.color = "#333333";
                }}
                onClick={handleSwitchNavMenu}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  color: pathname === setting.url ? "#007B7F" : "#333333",
                  backgroundColor:
                    pathname === setting.url ? "#f0f0f0" : "transparent",
                  transition: "color 0.3s ease",
                }}
              >
                {setting.icon}
                <Typography sx={{ textAlign: "center" }}>
                  {t(setting.title as keyof typeof t)}
                </Typography>
              </MenuItem>
            </Link>
          ))}
        </Menu>
      </Box>
    </>
  );
};
export default DesktopNavbar;
