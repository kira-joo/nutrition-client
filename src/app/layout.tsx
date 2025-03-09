// RootLayout.tsx
import * as React from "react";
import { Box } from "@mui/material";
import Footer from "./components/Footer/Footer";
import Navbar from "./components/header/Navbar";
import { Metadata } from "next";
import { Images } from "./components/constant/images";
import "./global.css";

export const metadata: Metadata = {
  title: "Dr.Omnia Ahmed",
  description: "A brief description of your website.",

  openGraph: {
    title: "Dr.Omnia Ahmed",
    description: "د/ أمنية أحمد أخصائية تغذية علاجية وسمنة ونحافة",
    images: [
      {
        url: Images.Image1,
        alt: "د/ أمنية أحمد أخصائية تغذية علاجية وسمنة ونحافة",
      },
    ],
    url: "./favicon.ico",
  },
  icons: "./favicon.ico",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <Box
          display="flex"
          flexDirection="column"
          mb={5}
          minHeight="80vh"
          sx={{
            pt: { xs: 5, md: 3 },
          }}
        >
          {/* Flexibility to customize layout per child */}
          {children}
        </Box>
        <Footer />
      </body>
    </html>
  );
}
