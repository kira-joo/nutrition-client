"use client";
import { DictionaryFiles } from "@/constant/DictionaryFiles";
import { Locale } from "@/constant/Locale.enum";
import { NavigatePages } from "@/constant/navigate-pages";
import useI18n from "@/hooks/useI18n";
import MenuIcon from "@mui/icons-material/Menu";
import {
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
} from "@mui/material";
import { useParams, usePathname } from "next/navigation"; // Import usePathname hook
import * as React from "react";
import AppLink from "../AppLink/AppLink";

const MobileNavbar = () => {
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const pathname = usePathname().split("/")[2];
  console.log(pathname);

  const { locale }: { locale: Locale } = useParams();

  const toggleDrawer =
    (open: boolean) => (event: React.MouseEvent | React.KeyboardEvent) => {
      if (
        event.type === "keydown" &&
        ((event as React.KeyboardEvent).key === "Tab" ||
          (event as React.KeyboardEvent).key === "Shift")
      ) {
        return;
      }
      setIsDrawerOpen(open);
    };
  const { t } = useI18n(DictionaryFiles.Home);

  return (
    <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
      <IconButton
        size="large"
        aria-label="menu"
        aria-controls="menu-appbar"
        aria-haspopup="true"
        onClick={toggleDrawer(true)}
        color="inherit"
      >
        <MenuIcon />
      </IconButton>
      <Drawer
        anchor={locale == Locale.AR ? "right" : "left"}
        open={isDrawerOpen}
        onClose={toggleDrawer(false)}
      >
        <Box
          sx={{ width: 250 }}
          role="presentation"
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
        >
          <List>
            {NavigatePages.map((page, i) => (
              <ListItem
                button
                key={i}
                sx={{
                  backgroundColor:
                    `/${pathname}` === page.url ? "#99d6d2" : "#ffffff",
                  "&:hover": {
                    backgroundColor: "#99d6d2",
                  },
                }}
              >
                <AppLink
                  href={page.url}
                  style={{
                    color: `/${pathname}` == page.url ? "#007B7F" : "#333333",
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <ListItemIcon>{page.icon}</ListItemIcon>
                  {t(page.title as keyof typeof t)}
                </AppLink>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </Box>
  );
};
export default MobileNavbar;
