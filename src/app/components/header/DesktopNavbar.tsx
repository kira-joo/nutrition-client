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
import { usePathname } from "next/navigation";
import { useState } from "react";
import AppLink from "../AppLink/AppLink";
import LanguageSwitch from "./LanguageSwitch";

interface DesktopNavbarProps {}

const DesktopNavbar: React.FC<DesktopNavbarProps> = () => {
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

  const handleSwitchNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    if (!anchorElUser) {
      setAnchorElUser(event.currentTarget);
    } else {
      setAnchorElUser(null);
    }
  };

  const pathname = usePathname();
  const appRoute = pathname.split("/")[2];
  const { t } = useI18n(DictionaryFiles.Home);
  return (
    <>
      <Box sx={{ ml: 2, flexGrow: 1, display: { xs: "none", md: "flex" } }}>
        {NavigatePages.map((page, i) => {
          const isActive = `/${appRoute}` === page.url;
          return (
            <AppLink key={i} href={page.url}>
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
            </AppLink>
          );
        })}
      </Box>
      <LanguageSwitch />

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
            <AppLink key={index} href={setting.url}>
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
                  color: appRoute === setting.url ? "#007B7F" : "#333333",
                  backgroundColor:
                    appRoute === setting.url ? "#f0f0f0" : "transparent",
                  transition: "color 0.3s ease",
                }}
              >
                {setting.icon}
                <Typography sx={{ textAlign: "center" }}>
                  {t(setting.title as keyof typeof t)}
                </Typography>
              </MenuItem>
            </AppLink>
          ))}
        </Menu>
      </Box>
    </>
  );
};
export default DesktopNavbar;
