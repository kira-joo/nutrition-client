import React from "react";
import { Typography, Alert, Button, Grid, Box } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import CheckCircleIcon from "@mui/icons-material/CheckCircle"; // Importing the icon
import SuccessSVG from "./successSVG";

interface SuccessMessageProps {
  message: string;
  onReset: () => void;
}

const SuccessMessage: React.FC<SuccessMessageProps> = ({
  message,
  onReset,
}) => {
  return (
    <Grid container spacing={2} alignItems="center">
      {/* SVG side (display none on small devices) */}
      <Grid
        item
        md={7}
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
          <SuccessSVG /> {/* SVG scaling */}
        </Box>
      </Grid>

      {/* Right side: Icon, success message, and button */}
      <Grid item xs={12} md={4}>
        {/* Icon above the message */}
        <Box sx={{ textAlign: "center", mb: 2 }}>
          <CheckCircleIcon sx={{ fontSize: 60, color: "#4caf50" }} />{" "}
          {/* Large success icon */}
        </Box>

        {/* Success Message */}
        <Typography variant="h5" align="center" sx={{ mb: 2 }}>
          We are glad you reached out!
        </Typography>

        <Alert severity="success" sx={{ mb: 2 }}>
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
          Send Another Message
        </Button>
      </Grid>
    </Grid>
  );
};

export default SuccessMessage;
