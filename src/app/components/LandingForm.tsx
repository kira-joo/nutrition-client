"use client";

import { WhatsappNumber } from "@/app/components/constant/numbers";
import { DictionaryFiles } from "@/constant/DictionaryFiles";
import useI18n from "@/hooks/useI18n";
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { useRef, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";

interface LandingFormProps {
  selectedProgram: "Weight Loss" | "Weight Gain" | null;
}

interface FormData {
  name: string;
  phone: string;
  age: string;
  weight: string;
  height: string;
  goal: "Loss" | "Gain";
}

export default function LandingForm({ selectedProgram }: LandingFormProps) {
  const { t } = useI18n(DictionaryFiles._15DayCamp);
  const hasTrackedLead = useRef(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    control,
  } = useForm<FormData>({
    mode: "onChange",
    defaultValues: {
      name: "",
      phone: "",
      age: "",
      weight: "",
      height: "",
      goal: "Loss",
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const onSubmit: SubmitHandler<FormData> = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      // Use selectedProgram if available, otherwise derive from goal field
      const program =
        selectedProgram ||
        (data.goal === "Loss" ? "Weight Loss" : "Weight Gain");
      const goalText =
        data.goal === "Loss" ? t("form.weightLoss") : t("form.weightGain");

      const whatsappMessage = `
🎯 *Camp Registration - ${program}*

📝 *Client Information:*
👤 Name: ${data.name}
📞 Phone: ${data.phone}
🎂 Age: ${data.age} years
⚖️ Weight: ${data.weight} kg
👤 Height: ${data.height} cm
🎯 Goal: ${goalText}
📋 Program: ${program}

I would like to register for the camp program.
      `.trim();

      // Create WhatsApp URL
      const whatsappUrl = `https://wa.me/${WhatsappNumber.replace(
        /[^0-9]/g,
        ""
      )}?text=${encodeURIComponent(whatsappMessage)}`;

      // Track CompleteRegistration event before opening WhatsApp
      const programForTracking =
        selectedProgram ||
        (data.goal === "Loss" ? "Weight Loss" : "Weight Gain");

      // Open WhatsApp in new tab
      window.open(whatsappUrl, "_blank");

      // Reset form
      reset();
      hasTrackedLead.current = false;
    } catch (error) {
      console.error("Error opening WhatsApp:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: "auto" }}>
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        sx={{
          bgcolor: "background.paper",
          p: { xs: 3, md: 5 },
          borderRadius: 3,
          boxShadow: `0 8px 32px rgba(0,0,0,0.1)`,
        }}
      >
        <Typography
          variant="h4"
          component="h2"
          align="center"
          gutterBottom
          sx={{
            fontWeight: 800,
            mb: 4,
            color: "#007B7F",
            fontSize: { xs: "1.75rem", md: "2.25rem" },
          }}
        >
          {t("form.registerNow")}
        </Typography>

        <TextField
          label={t("form.fullName")}
          fullWidth
          variant="outlined"
          {...register("name", {
            required: t("form.nameRequired"),
            minLength: { value: 2, message: t("form.nameMinLength") },
          })}
          error={!!errors.name}
          helperText={errors.name ? errors.name.message : ""}
          sx={{ mt: 2 }}
        />

        <TextField
          label={t("form.phoneNumber")}
          fullWidth
          variant="outlined"
          type="tel"
          {...register("phone", {
            required: t("form.phoneRequired"),
            pattern: {
              value: /^[0-9+\-\s()]+$/,
              message: t("form.phoneInvalid"),
            },
          })}
          error={!!errors.phone}
          helperText={errors.phone ? errors.phone.message : ""}
          sx={{ mt: 2 }}
        />

        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={4}>
            <TextField
              label={t("form.age")}
              fullWidth
              variant="outlined"
              type="number"
              {...register("age", {
                required: t("form.ageRequired"),
                min: { value: 10, message: t("form.ageMin") },
                max: { value: 120, message: t("form.ageMax") },
                valueAsNumber: false,
              })}
              error={!!errors.age}
              helperText={errors.age ? errors.age.message : ""}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              label={t("form.weight")}
              fullWidth
              variant="outlined"
              type="number"
              inputProps={{ step: "0.1", min: "20", max: "500" }}
              {...register("weight", {
                required: t("form.weightRequired"),
                min: { value: 20, message: t("form.weightMin") },
                max: {
                  value: 500,
                  message: t("form.weightMax"),
                },
                valueAsNumber: false,
              })}
              error={!!errors.weight}
              helperText={errors.weight ? errors.weight.message : ""}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label={t("form.height")}
              fullWidth
              variant="outlined"
              type="number"
              inputProps={{ step: "0.1", min: "50", max: "250" }}
              {...register("height", {
                required: t("form.heightRequired"),
                min: { value: 50, message: t("form.heightMin") },
                max: { value: 250, message: t("form.heightMax") },
                valueAsNumber: false,
              })}
              error={!!errors.height}
              helperText={errors.height ? errors.height.message : ""}
            />
          </Grid>
        </Grid>

        <FormControl fullWidth sx={{ mt: 2 }} required>
          <InputLabel id="goal-label">{t("form.goal")}</InputLabel>
          <Controller
            name="goal"
            control={control}
            rules={{ required: t("form.goalRequired") }}
            render={({ field }) => (
              <Select
                labelId="goal-label"
                id="goal"
                label={t("form.goal")}
                {...field}
                error={!!errors.goal}
              >
                <MenuItem value="Loss">{t("form.weightLoss")}</MenuItem>
                <MenuItem value="Gain">{t("form.weightGain")}</MenuItem>
              </Select>
            )}
          />
          {errors.goal && (
            <Typography
              variant="caption"
              color="error"
              sx={{ mt: 0.5, ml: 1.75 }}
            >
              {errors.goal.message}
            </Typography>
          )}
        </FormControl>

        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          disabled={isSubmitting || !isValid}
          sx={{
            mt: 4,
            py: 2,
            fontSize: "1.1rem",
            fontWeight: 700,
            background: "linear-gradient(45deg, #4db6b2, #04715d)",
            boxShadow: `0 8px 20px rgba(77, 182, 178, 0.4)`,
            "&:hover": {
              background: "linear-gradient(45deg, #04715d, #00796b)",
              boxShadow: `0 12px 24px rgba(77, 182, 178, 0.5)`,
              transform: "translateY(-2px)",
            },
            transition: "all 0.3s ease",
          }}
          startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
        >
          {isSubmitting ? t("form.submitting") : t("form.submitRegistration")}
        </Button>
      </Box>
    </Box>
  );
}
