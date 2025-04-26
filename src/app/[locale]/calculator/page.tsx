"use client";
import React, { useState } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
  Grid,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import DietSVG from "./Calculate";
import { ActivityLevels  } from "@/app/constant/activity-levels";

interface FormValues {
  age: number;
  weight: number; // in kg
  height: number; // in cm
  activityLevel: string;
}

const NutritionCalculator: React.FC = () => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    defaultValues: {
      age: 0,
      weight: 0,
      height: 0,
      activityLevel: "sedentary",
    },
  });

  const [caloricNeeds, setCaloricNeeds] = useState<number | null>(null);
  const [gender, setGender] = useState<string>("male"); // Default gender
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string>("");

  const calculateCalories = async (data: FormValues) => {
    setLoading(true);
    setFetchError("");

    try {
      const { age, weight, height, activityLevel } = data;

      const bmr =
        gender === "male"
          ? 10 * weight + 6.25 * height - 5 * age + 5
          : 10 * weight + 6.25 * height - 5 * age - 161; // Adjusted for women

      let activityMultiplier = 1.2; // Sedentary by default

      switch (activityLevel) {
        case "light":
          activityMultiplier = 1.375;
          break;
        case "moderate":
          activityMultiplier = 1.55;
          break;
        case "active":
          activityMultiplier = 1.725;
          break;
        case "very-active":
          activityMultiplier = 1.9;
          break;
        default:
          activityMultiplier = 1.2;
      }

      const dailyCalories = Math.round(bmr * activityMultiplier);
      setCaloricNeeds(dailyCalories);
    } catch (err) {
      setFetchError("Failed to calculate calories. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    reset();
    setCaloricNeeds(null);
    setFetchError("");
  };

  if (fetchError) {
    return (
      <Container maxWidth="sm">
        <Typography variant="h6" color="error" align="left">
          {fetchError}
        </Typography>
        <Button
          variant="outlined"
          onClick={handleReset}
          fullWidth
          sx={{ mt: 2 }}
        >
          Reset
        </Button>
      </Container>
    );
  }

  return (
    <Container>
      <Grid container spacing={2}>
        <Grid
          item
          md={6} // Show on md and up
          sx={{
            mb: 20,
            display: { xs: "none", md: "flex" }, // Hide on xs and sm devices
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
            <DietSVG />
          </Box>
        </Grid>
        {/* Left Column: Form and Gender Selector */}
        <Grid item xs={12} md={6} sx={{ textAlign: "left" }}>
          <Typography variant="h4" align="center" gutterBottom>
            Calculate Calories
          </Typography>

          {/* Gender Selection */}
          <Grid item>
            <Typography variant="h6" align="center" gutterBottom>
              Select Gender
            </Typography>

            <ToggleButtonGroup
              value={gender}
              exclusive
              onChange={(event, newGender) => {
                if (newGender !== null) {
                  setGender(newGender);
                }
              }}
              fullWidth
            >
              <ToggleButton
                value="male"
                sx={{
                  flexGrow: 1,
                  bgcolor: "#a37871",
                  "&.Mui-selected": { bgcolor: "#4caf50" },
                }}
              >
                Men
              </ToggleButton>
              <ToggleButton
                value="female"
                sx={{
                  flexGrow: 1,
                  bgcolor: "#a37871",
                  "&.Mui-selected": { bgcolor: "#4caf50" },
                }}
              >
                Women
              </ToggleButton>
            </ToggleButtonGroup>
          </Grid>

          {/* Form Inputs */}
          <Grid item>
            <Box
              component="form"
              noValidate // Disable browser validation
              onSubmit={handleSubmit(calculateCalories)}
              sx={{ display: "flex", flexDirection: "column", gap: 2 }}
            >
              <Controller
                name="age"
                control={control}
                rules={{ min: 1 }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Age"
                    type="number"
                    fullWidth
                    variant="outlined"
                    inputProps={{ min: 1 }}
                    error={!!errors.age}
                    helperText={
                      errors.age
                        ? "Age is required and must be greater than 0"
                        : ""
                    }
                    sx={{ bgcolor: "transparent", mt: 2 }}
                  />
                )}
              />

              <Controller
                name="weight"
                control={control}
                rules={{ min: 1 }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Weight (kg)"
                    type="number"
                    fullWidth
                    variant="outlined"
                    inputProps={{ min: 1 }}
                    error={!!errors.weight}
                    helperText={
                      errors.weight
                        ? "Weight is required and must be greater than 0"
                        : ""
                    }
                    sx={{ bgcolor: "transparent" }}
                  />
                )}
              />

              <Controller
                name="height"
                control={control}
                rules={{ min: 1 }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Height (cm)"
                    type="number"
                    fullWidth
                    variant="outlined"
                    inputProps={{ min: 1 }}
                    error={!!errors.height}
                    helperText={
                      errors.height
                        ? "Height is required and must be greater than 0"
                        : ""
                    }
                    sx={{ bgcolor: "transparent" }}
                  />
                )}
              />

              <Controller
                name="activityLevel"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.activityLevel}>
                    <InputLabel>Activity Level</InputLabel>
                    <Select
                      {...field}
                      label="Activity Level"
                      sx={{
                        fontSize: { md: "0.600rem", lg: "1rem" },
                      }}
                    >
                      {ActivityLevels.map((option) => (
                        <MenuItem
                          key={option.value}
                          value={option.value}
                          sx={{ fontSize: "0.750rem" }}
                        >
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.activityLevel && (
                      <Typography variant="caption" color="error">
                        Activity level is required.
                      </Typography>
                    )}
                  </FormControl>
                )}
              />

              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                endIcon={loading ? <CircularProgress size={24} /> : null}
                disabled={loading}
                sx={{
                  backgroundColor: "#4caf50",
                  "&:hover": { backgroundColor: "#388e3c" },
                }}
              >
                {loading ? "Calculating..." : "Calculate"}
              </Button>
            </Box>
          </Grid>

          {/* Caloric Needs Result */}
          {caloricNeeds !== null && (
            <Grid item xs={12}>
              <Typography variant="h6" align="center" sx={{ mt: 2 }}>
                Daily Caloric Needs: {caloricNeeds} kcal
              </Typography>
            </Grid>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default NutritionCalculator;
