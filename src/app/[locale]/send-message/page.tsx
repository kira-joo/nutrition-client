"use client";
import { WhatsappNumber } from "@/app/components/constant/numbers";
import { DictionaryFiles } from "@/constant/DictionaryFiles";
import useI18n from "@/hooks/useI18n";
import { useIsRtl } from "@/hooks/useIsRtl";
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
import Image from "next/image";
import React, { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

interface FormValues {
  message: string;
}

const SendMessage: React.FC = () => {
  const { t } = useI18n(DictionaryFiles.SendMessage);
  const isRTL = useIsRtl();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    mode: "all",
    defaultValues: {
      message: "",
    },
  });

  const [loading, setLoading] = useState<boolean>(false);

  const onSubmit: SubmitHandler<FormValues> = async (data: FormValues) => {
    setLoading(true);

    try {
      const encodedMessage = encodeURIComponent(`👋 ${data.message}`);
      const whatsappUrl = `https://wa.me/${WhatsappNumber}?text=${encodedMessage}`;
      window.open(whatsappUrl, "_blank");
      reset();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <Grid container spacing={2}>
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
              label={t("Message")}
              multiline
              rows={5}
              fullWidth
              variant="outlined"
              {...register("message", {
                required: t("MessageIsRequired"),
                minLength: { value: 1, message: t("MessageCannotBeEmpty") },
                maxLength: {
                  value: 500,
                  message: t("MessageMustBeUnder500Characters"),
                },
              })}
              error={!!errors.message}
              helperText={errors.message ? errors.message.message : ""}
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
                mt: 3,
                backgroundColor: "#4caf50",
                "&:hover": { backgroundColor: "#388e3c" },
              }}
            >
              {loading ? t("Sending") : t("SendViaWhatsApp")}
            </Button>
          </Box>
        </Grid>

        {/* Left Column: SVG */}
        <Grid
          item
          xs={12}
          md={6}
          sx={{
            display: { xs: "none", md: "flex" },
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
              transform: isRTL ? "scaleX(-1)" : "scaleX(1)",
            }}
          >
            <Image
              src="/images/download.svg"
              alt="Send Message Illustration"
              width={400}
              height={400}
              style={{ width: "100%", height: "auto" }}
            />
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default SendMessage;
