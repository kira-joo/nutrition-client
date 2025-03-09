import { Box } from "@mui/material";
import React from "react";

interface CustomContainerProps {
  children: React.ReactNode;
}

const CustomContainerWithFlex: React.FC<CustomContainerProps> = ({ children }) => {
  return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: { xs: "10px", sm: "10px 30px", lg: "10px 60px" } }}>
      {children}
    </Box>
  );
};

export default CustomContainerWithFlex;
