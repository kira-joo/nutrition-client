"use client";
// pages/newsletter-signup.tsx
import {
  Alert,
  Box,
  Button,
  Container,
  TextField,
  Typography,
} from "@mui/material";
import React from "react";
import { SubmitHandler, useForm } from "react-hook-form";

// Define the form input types
interface IFormInput {
  email: string;
}

const NewsletterSignup: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitSuccessful },
    reset,
  } = useForm<IFormInput>({
    mode: "all", // Validate on both change and blur events
    defaultValues: {
      email: "", // You can set the initial email value here
    },
  });

  const onSubmit: SubmitHandler<IFormInput> = async (_data: IFormInput) => {
    try {
      reset(); // Reset the form on successful submission
    } catch (err) {
      console.error("Error submitting email:", err);
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom align="center">
        Sign Up for Our Newsletter
      </Typography>
      <Typography variant="body1" gutterBottom align="center">
        Get the latest nutrition tips and news directly in your inbox.
      </Typography>

      {isSubmitSuccessful ? (
        <Alert severity="success">Thank you for signing up!</Alert>
      ) : (
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 3 }}>
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
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
          >
            Subscribe
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default NewsletterSignup;
