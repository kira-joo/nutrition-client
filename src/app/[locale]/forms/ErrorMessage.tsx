import React from "react";
import { Typography, Alert, Button, Grid, Box } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline"; // Importing the error icon
import ErrorSVG from "./errorSVG";

interface ErrorMessageProps {
  message: string;
  onReset: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onReset }) => {
  return (
    <Grid container spacing={2} alignItems="center">
      {/* Left side: Error message */}
      <Grid item xs={12} md={5} sx={{ ml: { xs: 0, md: 10 } }}>
        {/* Icon above the message */}
        <Box sx={{ textAlign: "center", mb: 2 }}>
          <ErrorOutlineIcon sx={{ fontSize: 60, color: "#f44336" }} />{" "}
          {/* Large error icon */}
        </Box>

        {/* Error Message */}
        <Typography variant="h5" align="center" sx={{ mb: 2 }}>
          Oops! Something went wrong.
        </Typography>

        <Alert severity="error" sx={{ mb: 2 }}>
          {message}
        </Alert>

        {/* Button */}
        <Button
          fullWidth
          variant="contained"
          sx={{
            backgroundColor: "#4caf50",
            "&:hover": { backgroundColor: "#388e3c" },
          }}
          onClick={onReset}
          endIcon={<SendIcon />}
        >
          Try Again
        </Button>
      </Grid>

      {/* Right side: Error SVG (display none on small devices) */}
      <Grid
        item
        md={6}
        sx={{
          display: { xs: "none", md: "flex" }, // Hidden on small screens
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Box
          sx={{
            width: "100%",
            height: "100%",
            maxWidth: "400px",
            maxHeight: "400px",
          }}
        >
          <ErrorSVG /> {/* SVG scaling */}
        </Box>
      </Grid>
    </Grid>
  );
};

export default ErrorMessage;
