"use client";
import SendIcon from "@mui/icons-material/Send";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

import { sendEmail } from "@/utils/sendMessage";
import ErrorMessage from "./ErrorMessage";
import MessageSVG from "./message";
import SuccessMessage from "./SuccessMessage";

interface FormValues {
  email: string;
  message: string;
  phone?: string;
}

const SendMessage: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    mode: "all",
    defaultValues: {
      email: "",
      message: "",
      phone: "",
    },
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<string>("");
  const [fetchError, setFetchError] = useState<string>("");

  const onSubmit: SubmitHandler<FormValues> = async (data: FormValues) => {
    setLoading(true);
    setSuccess("");
    setFetchError("");

    try {
      await sendEmail(data);
      setSuccess("Message sent successfully!");
      reset();
    } catch (err) {
      setFetchError("Failed to send Mail. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    reset();
    setSuccess("");
    setFetchError("");
  };

  if (success) {
    return <SuccessMessage message={success} onReset={handleReset} />;
  }

  if (fetchError) {
    return <ErrorMessage message={fetchError} onReset={handleReset} />;
  }

  return (
    <Container maxWidth="lg">
      <Grid container spacing={2}>
        {/* Left Column: SVG */}

        {/* Right Column: Contact Form */}
        <Grid item xs={12} md={6}>
          <Typography variant="h4" gutterBottom align="center">
            Send Message
          </Typography>
          <Typography variant="body1" gutterBottom align="center">
            We would love to hear from you! Send us your message below.
          </Typography>

          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            sx={{ mt: 3 }}
          >
            <TextField
              label="Email"
              fullWidth
              variant="outlined"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Please enter a valid email address",
                },
              })}
              error={!!errors.email}
              helperText={errors.email ? errors.email.message : ""}
            />

            <TextField
              label="Message"
              multiline
              rows={4}
              fullWidth
              variant="outlined"
              {...register("message", {
                required: "Message is required",
                minLength: {
                  value: 1,
                  message: "Message cannot be empty",
                },
                maxLength: {
                  value: 500,
                  message: "Message must be under 500 characters",
                },
              })}
              error={!!errors.message}
              helperText={errors.message ? errors.message.message : ""}
              sx={{ mt: 2 }}
            />

            <TextField
              label="Phone Number (Optional)"
              fullWidth
              variant="outlined"
              {...register("phone", {
                pattern: {
                  value: /^[+]?[0-9]{11}$/,
                  message: "Invalid phone number, must be 11 digits",
                },
              })}
              error={!!errors.phone}
              helperText={errors.phone ? errors.phone.message : ""}
              sx={{ mt: 2 }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              endIcon={loading ? <CircularProgress size={24} /> : <SendIcon />}
              disabled={loading}
              sx={{
                mt: 2,
                backgroundColor: "#4caf50",
                "&:hover": { backgroundColor: "#388e3c" },
              }}
            >
              {loading ? "Sending..." : "Send Email"}
            </Button>
          </Box>
        </Grid>

        <Grid
          item
          xs={12}
          md={6} // Show on md and up
          sx={{
            display: { xs: "none", md: "flex" }, // Hide on xs and sm devices
            justifyContent: "center",
            alignItems: "center",
            mb: 20,
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
            <MessageSVG /> {/* Replace with your SVG */}
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default SendMessage;
