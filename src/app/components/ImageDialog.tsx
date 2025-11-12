"use client";

import CloseIcon from "@mui/icons-material/Close";
import { Box, Dialog, IconButton } from "@mui/material";
import Image from "next/image";
import { useState } from "react";

interface ImageDialogProps {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  style?: React.CSSProperties;
}

const ImageDialog = ({
  src,
  alt = "Image",
  width,
  height,
  style,
}: ImageDialogProps) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Image with hover effect */}
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          borderRadius: 3,
          transition: "transform 0.3s ease, box-shadow 0.3s ease",
          cursor: "pointer",
          "&:hover": {
            transform: "translateY(-8px)",
            boxShadow: "0 12px 40px rgba(0, 123, 127, 0.25)",
          },
        }}
        onClick={() => setOpen(true)}
      >
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          style={{
            borderRadius: "12px",
            objectFit: "cover",
            width: "100%",
            height: "100%",
            ...style,
          }}
        />
      </Box>

      {/* Dialog to show full-size image */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="lg">
        <Box sx={{ position: "relative" }}>
          <IconButton
            onClick={() => setOpen(false)}
            sx={{
              position: "absolute",
              top: 10,
              right: 10,
              zIndex: 2,
              backgroundColor: "rgba(255,255,255,0.8)",
              "&:hover": { backgroundColor: "rgba(255,255,255,1)" },
            }}
          >
            <CloseIcon />
          </IconButton>
          <Box sx={{ p: 2 }}>
            <Image
              src={src}
              alt={alt}
              width={900}
              height={700}
              style={{
                borderRadius: "8px",
                objectFit: "contain",
                width: "100%",
                height: "auto",
              }}
            />
          </Box>
        </Box>
      </Dialog>
    </>
  );
};

export default ImageDialog;
