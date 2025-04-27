"use client";
import { DictionaryFiles } from "@/constant/DictionaryFiles";
import useI18n from "@/hooks/useI18n";
import { sendEmail } from "@/utils/sendMessage";
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
import ErrorMessage from "./ErrorMessage";
import MessageSVG from "./message";
import SuccessMessage from "./SuccessMessage";

interface FormValues {
  email: string;
  message: string;
  phone?: string;
}

const SendMessage: React.FC = () => {
  const { t } = useI18n(DictionaryFiles.SendMessage);
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
      setSuccess(t("MessageSentSuccessfully"));
      reset();
    } catch (err) {
      setFetchError(t("FailedToSendMail"));
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
            {t("SendMessage")}
          </Typography>
          <Typography variant="body1" gutterBottom align="center">
            {t("WeWouldLoveToHearFromYou")}
          </Typography>

          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            sx={{ mt: 3 }}
          >
            <TextField
              label={t("Email")}
              fullWidth
              variant="outlined"
              {...register("email", {
                required: t("EmailIsRequired"),
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: t("PleaseEnterValidEmail"),
                },
              })}
              error={!!errors.email}
              helperText={errors.email ? errors.email.message : ""}
            />

            <TextField
              label={t("Message")}
              multiline
              rows={4}
              fullWidth
              variant="outlined"
              {...register("message", {
                required: t("MessageIsRequired"),
                minLength: {
                  value: 1,
                  message: t("MessageCannotBeEmpty"),
                },
                maxLength: {
                  value: 500,
                  message: t("MessageMustBeUnder500Characters"),
                },
              })}
              error={!!errors.message}
              helperText={errors.message ? errors.message.message : ""}
              sx={{ mt: 2 }}
            />

            <TextField
              label={t("PhoneNumberOptional")}
              fullWidth
              variant="outlined"
              {...register("phone", {
                pattern: {
                  value: /^[+]?[0-9]{11}$/,
                  message: t("InvalidPhoneNumber"),
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
              endIcon={
                loading ? (
                  <CircularProgress size={24} />
                ) : (
                  <SendIcon sx={{ mx: 1 }} />
                )
              }
              disabled={loading}
              sx={{
                mt: 2,
                backgroundColor: "#4caf50",
                marginX: "auto",
                "&:hover": { backgroundColor: "#388e3c" },
              }}
            >
              {loading ? t("Sending") : t("SendEmail")}
            </Button>
          </Box>
        </Grid>

        <Grid
          item
          xs={12}
          md={6}
          sx={{
            display: { xs: "none", md: "flex" },
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
            <Box>
              <MessageSVG />
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default SendMessage;
