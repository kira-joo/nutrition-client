"use client";
import { NavigatePages } from "@/constant/navigate-pages";
import MenuIcon from "@mui/icons-material/Menu";
import {
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import Link from "next/link";
import { usePathname } from "next/navigation"; // Import usePathname hook
import * as React from "react";

export default function MobileNavbar() {
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const pathname = usePathname(); // Get the current path

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

  return (
    <>
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

        <Drawer anchor="left" open={isDrawerOpen} onClose={toggleDrawer(false)}>
          <Box
            sx={{ width: 250 }} // Set width of the sidebar
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
                      pathname === page.url ? "#99d6d2" : "#ffffff", // Change background if active
                    "&:hover": {
                      backgroundColor: "#99d6d2", // Darken on hover
                    },
                  }}
                >
                  <Link
                    href={page.url}
                    style={{
                      color: pathname === page.url ? "#007B7F" : "#333333", // Change text color if active
                      textDecoration: "none",
                      display: "flex", // Flex layout for icon and text
                      alignItems: "center",
                      width: "100%", // Ensure the link takes full width
                    }}
                  >
                    <ListItemIcon>{page.icon}</ListItemIcon>
                    <ListItemText primary={page.title} />
                  </Link>
                </ListItem>
              ))}
            </List>
          </Box>
        </Drawer>
      </Box>
    </>
  );
}
