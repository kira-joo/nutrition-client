"use client";
import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";

interface FormValues {
  email: string;
  message: string;
}

export default function SubmitForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    mode: "onBlur",
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<string>("");
  const [fetchError, setFetchError] = useState<string>("");

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setLoading(true);
    setSuccess("");
    setFetchError("");

    try {
      const res = await fetch("http://localhost:3333/mail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error("Validation failed, please try again later");
      }

      setSuccess("Email sent successfully!");
      reset();
    } catch (err) {
      setFetchError("Failed to send email. Please try again later.");
    } finally {
      setLoading(false);
      setTimeout(() => {
        setSuccess("");
        setFetchError("");
      }, 3000);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Invalid email address",
              },
            })}
          />
          {errors.email && (
            <p style={{ color: "red" }}>{errors.email.message}</p>
          )}
        </div>

        <div>
          <label>Message:</label>
          <textarea
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
          />
          {errors.message && (
            <p style={{ color: "red" }}>{errors.message.message}</p>
          )}
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send Email"}
        </button>
      </form>

      {success && <p style={{ color: "green" }}>{success}</p>}
      {fetchError && <p style={{ color: "red" }}>{fetchError}</p>}
    </div>
  );
}
