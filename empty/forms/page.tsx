"use client";
import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import styles from "./Form.module.css";

interface FormValues {
  email: string;
  message: string;
  phone?: string;
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
        throw new Error("Failed to send Mail. Please try again later.");
      }

      setSuccess("Email sent successfully!");
      reset();
    } catch (err) {
      setFetchError("Failed to send Mail. Please try again later.");
    } finally {
      setLoading(false);
      setTimeout(() => {
        setSuccess("");
        setFetchError("");
      }, 3000);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.text}>send message</h1>
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <div className={styles.field}>
          <label className={styles.label}>Email:</label>
          <input
            type="email"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Invalid email address",
              },
            })}
            className={styles.input}
          />
          {errors.email && (
            <button className={styles.messageButton}>
              <p className={styles.error}>{errors.email.message}</p>
            </button>
          )}
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Message:</label>
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
            className={styles.textarea}
          />
          {errors.message && (
            <button className={styles.messageButton}>
              <p className={styles.error}>{errors.message.message}</p>
            </button>
          )}
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Phone Number (Optional):</label>
          <input
            type="text"
            {...register("phone", {
              pattern: {
                value: /^[+]?[0-9]{10,15}$/,
                message: "Invalid phone number",
              },
            })}
            className={styles.input}
          />
          {errors.phone && (
            <button className={styles.messageButton}>
              <p className={styles.error} style={{ color: "red" }}>
                {errors.phone.message}
              </p>
            </button>
          )}
        </div>

        <button className={styles.button} type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send Email"}
        </button>
      </form>

      {success && <p className={styles.success}>{success}</p>}
      {fetchError && <p className={styles.error}>{fetchError}</p>}
    </div>
  );
}
