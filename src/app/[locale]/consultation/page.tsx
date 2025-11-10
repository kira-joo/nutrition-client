"use client";
import { DictionaryFiles } from "@/constant/DictionaryFiles";
import useI18n from "@/hooks/useI18n";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
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
import ErrorMessage from "../send-message/ErrorMessage";
import SuccessMessage from "../send-message/SuccessMessage";

interface FormValues {
  name: string;
  age: string;
  height: string;
  weight: string;
  medicalHistory: string;
  lifestyle: string;
  sleepPattern: string;
  workType: string;
  physicalActivity: string;
  additionalNotes?: string;
}

const ConsultationRequest: React.FC = () => {
  const { t } = useI18n(DictionaryFiles.SendMessage);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    mode: "all",
    defaultValues: {
      name: "",
      age: "",
      height: "",
      weight: "",
      medicalHistory: "",
      lifestyle: "",
      sleepPattern: "",
      workType: "",
      physicalActivity: "",
      additionalNotes: "",
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
      // Format the message for WhatsApp
      const whatsappMessage = `
اهلا وسهلا بحضرتك 🌟
معاكم د. أمنية أحمد، أخصائية التغذية العلاجية

بيانات المريض:
📝 الاسم: ${data.name}
📅 العمر: ${data.age} سنة
📏 الطول: ${data.height} سم
⚖️ الوزن: ${data.weight} كيلو

📋 التاريخ المرضي:
${data.medicalHistory}

🏠 نمط الحياة:
${data.lifestyle}

😴 نمط النوم:
${data.sleepPattern}

💼 نوع العمل:
${data.workType}

🏃‍♂️ النشاط البدني:
${data.physicalActivity}

${data.additionalNotes ? `📝 ملاحظات إضافية:\n${data.additionalNotes}` : ""}

أطلب استشارة تغذية شخصية مصممة خصيصاً لي.
      `.trim();

      // WhatsApp phone number (replace with your actual number)
      const phoneNumber = "201110373648"; // Replace with your WhatsApp number
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
        whatsappMessage
      )}`;

      // Open WhatsApp
      window.open(whatsappUrl, "_blank");

      setSuccess(t("ConsultationRequestSentSuccessfully"));
      reset();
    } catch (err) {
      setFetchError(t("FailedToSendConsultationRequest"));
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
      <Grid
        container
        spacing={{ xs: 2, md: 10 }}
        sx={{ justifyContent: "space-between" }}
      >
        <Grid
          item
          xs={12}
          md={6}
          sx={{
            display: { xs: "flex", md: "flex" },
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            mb: 10,
            pl: 4,
          }}
        >
          <Box
            sx={{
              width: "100%",
              maxWidth: "400px",
              backgroundColor: "#f8f9fa",
              borderRadius: 3,
              p: 3,
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              border: "1px solid #e0e0e0",
            }}
          >
            <Box sx={{ textAlign: "center", mb: 3 }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  backgroundColor: "#4caf50",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                  fontSize: "2rem",
                }}
              >
                👩‍⚕️
              </Box>
              <Typography
                variant="h5"
                sx={{ fontWeight: 600, color: "#2e7d32", mb: 1 }}
              >
                {t("DoctorName")}
              </Typography>
              <Typography variant="body2" sx={{ color: "#666", mb: 2 }}>
                {t("DoctorTitle")}
              </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, mb: 2, color: "#2e7d32" }}
              >
                {t("WelcomeTitle")}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "#666", lineHeight: 1.6, mb: 2 }}
              >
                {t("WelcomeMessage")}
              </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, mb: 2, color: "#2e7d32" }}
              >
                {t("WhatINeedTitle")}
              </Typography>
              <Box sx={{ pl: 2 }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: "#666",
                    mb: 1,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {t("BasicInfo")}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "#666",
                    mb: 1,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {t("MedicalHistoryAndCondition")}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "#666",
                    mb: 1,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {t("LifestyleAndHabits")}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "#666",
                    mb: 1,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {t("PhysicalActivities")}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, mb: 2, color: "#2e7d32" }}
              >
                {t("TipsTitle")}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "#666", lineHeight: 1.6, mb: 2 }}
              >
                {t("LabTestsNote")}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "#666", lineHeight: 1.6, mb: 2 }}
              >
                {t("InbodyNote")}
              </Typography>
            </Box>

            <Box
              sx={{
                backgroundColor: "#4caf50",
                color: "white",
                borderRadius: 2,
                p: 2,
                textAlign: "center",
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {t("PersonalConsultationTitle")}
              </Typography>
              <Typography variant="body2" sx={{ fontSize: "0.875rem", mt: 1 }}>
                {t("PersonalConsultationSubtitle")}
              </Typography>
            </Box>
          </Box>
        </Grid>
        {/* Right Column: Consultation Form */}
        <Grid item xs={12} md={6}>
          <Typography variant="h4" gutterBottom align="center">
            {t("ConsultationRequest")}
          </Typography>
          <Typography variant="body1" gutterBottom align="center">
            {t(
              "PleaseProvideYourInformationForPersonalizedNutritionConsultation"
            )}
          </Typography>

          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            sx={{ mt: 3 }}
          >
            <TextField
              label={t("Name")}
              fullWidth
              variant="outlined"
              {...register("name", {
                required: t("NameIsRequired"),
                minLength: {
                  value: 2,
                  message: t("NameMustBeAtLeast2Characters"),
                },
              })}
              error={!!errors.name}
              helperText={errors.name ? errors.name.message : ""}
            />

            <TextField
              label={t("Age")}
              fullWidth
              variant="outlined"
              type="number"
              {...register("age", {
                required: t("AgeIsRequired"),
                min: {
                  value: 1,
                  message: t("AgeCannotBeLessThan1"),
                },
                max: {
                  value: 120,
                  message: t("AgeCannotBeMoreThan120"),
                },
              })}
              error={!!errors.age}
              helperText={errors.age ? errors.age.message : ""}
              sx={{ mt: 2 }}
            />

            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={6}>
                <TextField
                  label={t("Height")}
                  fullWidth
                  variant="outlined"
                  type="number"
                  {...register("height", {
                    required: t("HeightIsRequired"),
                    min: {
                      value: 50,
                      message: t("HeightCannotBeLessThan50"),
                    },
                    max: {
                      value: 250,
                      message: t("HeightCannotBeMoreThan250"),
                    },
                  })}
                  error={!!errors.height}
                  helperText={
                    errors.height ? errors.height.message : t("InCentimeters")
                  }
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label={t("Weight")}
                  fullWidth
                  variant="outlined"
                  type="number"
                  {...register("weight", {
                    required: t("WeightIsRequired"),
                    min: {
                      value: 10,
                      message: t("WeightCannotBeLessThan10"),
                    },
                    max: {
                      value: 300,
                      message: t("WeightCannotBeMoreThan300"),
                    },
                  })}
                  error={!!errors.weight}
                  helperText={
                    errors.weight ? errors.weight.message : t("InKilograms")
                  }
                />
              </Grid>
            </Grid>

            <TextField
              label={t("MedicalHistory")}
              multiline
              rows={3}
              fullWidth
              variant="outlined"
              {...register("medicalHistory", {
                required: t("MedicalHistoryIsRequired"),
                minLength: {
                  value: 10,
                  message: t("MedicalHistoryMustBeAtLeast10Characters"),
                },
              })}
              error={!!errors.medicalHistory}
              helperText={
                errors.medicalHistory
                  ? errors.medicalHistory.message
                  : t("PleaseDescribeAnyMedicalConditions")
              }
              sx={{ mt: 2 }}
            />

            <TextField
              label={t("Lifestyle")}
              multiline
              rows={3}
              fullWidth
              variant="outlined"
              {...register("lifestyle", {
                required: t("LifestyleIsRequired"),
                minLength: {
                  value: 10,
                  message: t("LifestyleMustBeAtLeast10Characters"),
                },
              })}
              error={!!errors.lifestyle}
              helperText={
                errors.lifestyle
                  ? errors.lifestyle.message
                  : t("DescribeYourDailyRoutineAndHabits")
              }
              sx={{ mt: 2 }}
            />

            <TextField
              label={t("SleepPattern")}
              fullWidth
              variant="outlined"
              {...register("sleepPattern", {
                required: t("SleepPatternIsRequired"),
                minLength: {
                  value: 5,
                  message: t("SleepPatternMustBeAtLeast5Characters"),
                },
              })}
              error={!!errors.sleepPattern}
              helperText={
                errors.sleepPattern
                  ? errors.sleepPattern.message
                  : t("DescribeYourSleepSchedule")
              }
              sx={{ mt: 2 }}
            />

            <TextField
              label={t("WorkType")}
              fullWidth
              variant="outlined"
              {...register("workType", {
                required: t("WorkTypeIsRequired"),
                minLength: {
                  value: 3,
                  message: t("WorkTypeMustBeAtLeast3Characters"),
                },
              })}
              error={!!errors.workType}
              helperText={
                errors.workType
                  ? errors.workType.message
                  : t("DescribeYourWorkAndDailyActivities")
              }
              sx={{ mt: 2 }}
            />

            <TextField
              label={t("PhysicalActivity")}
              fullWidth
              variant="outlined"
              {...register("physicalActivity", {
                required: t("PhysicalActivityIsRequired"),
                minLength: {
                  value: 5,
                  message: t("PhysicalActivityMustBeAtLeast5Characters"),
                },
              })}
              error={!!errors.physicalActivity}
              helperText={
                errors.physicalActivity
                  ? errors.physicalActivity.message
                  : t("DescribeYourExerciseRoutine")
              }
              sx={{ mt: 2 }}
            />

            <TextField
              label={t("AdditionalNotes")}
              multiline
              rows={2}
              fullWidth
              variant="outlined"
              {...register("additionalNotes")}
              error={!!errors.additionalNotes}
              helperText={t("AnyAdditionalInformationOptional")}
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
                  <WhatsAppIcon sx={{ mx: 1 }} />
                )
              }
              disabled={loading || Object.keys(errors).length > 0}
              sx={{
                mt: 2,
                backgroundColor: "#4caf50",
                fontSize: 14,
                marginX: "auto",
                "&:hover": { backgroundColor: "#388e3c" },
              }}
            >
              {loading ? t("SendingToWhatsApp") : t("SendConsultationRequest")}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ConsultationRequest;
