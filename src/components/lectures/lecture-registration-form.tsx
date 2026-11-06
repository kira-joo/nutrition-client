"use client";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { FormInput } from "@kira-joo/frontend-toolkit-tailwind/forms";
import type { AppError } from "@kira-joo/frontend-toolkit-core";
import { useConsultationRequest } from "@/lib/mutations/use-consultation-request";
import { ConsultationRequestIntent, type CreateConsultationRequestInput } from "@/lib/domain/consultation-request";
import { toLatinDigits } from "@/lib/lectures/format";
import { Button } from "@/components/ui/button";

interface FormValues {
  name: string;
  phone: string;
}

const EMPTY_VALUES: FormValues = { name: "", phone: "" };

/** Same shape the consultation form accepts, applied after Arabic-Indic digits are normalised. */
const PHONE_PATTERN = /^[\d+\s-]{7,20}$/;

/**
 * nutrition-staff's `CreateConsultationRequestDto` requires `intent`, and the
 * endpoint is reused as-is. `NEWSLETTER` ("signed up for content") is the
 * existing value closest to a lecture sign-up — `CONSULTATION` would tell staff
 * this visitor asked to book a session. Intent is only a display label in
 * staff; no behaviour branches on it.
 */
const LECTURE_INTENT = ConsultationRequestIntent.NEWSLETTER;

export interface LectureRegistrationFormProps {
  lectureTitle: string;
  onRegistered: () => void;
}

/**
 * Records the visitor through the existing public lead-capture endpoint
 * (this app's `/api/consultation-requests` proxy → nutrition-staff), via the
 * same `useConsultationRequest` hook the consultation form uses. Only a
 * successful response calls `onRegistered`; any failure keeps the lecture
 * locked and shows an error.
 */
export function LectureRegistrationForm({ lectureTitle, onRegistered }: LectureRegistrationFormProps) {
  const t = useTranslations("lectures.gate");
  const errorRegionRef = useRef<HTMLDivElement>(null);
  const [bannerError, setBannerError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setError,
    formState: { isSubmitting },
  } = useForm<FormValues>({ defaultValues: EMPTY_VALUES, mode: "onBlur" });

  const { submit, loading } = useConsultationRequest({
    onSuccess: () => {
      setBannerError(null);
      onRegistered();
    },
    onError: (error: AppError) => {
      let mappedAny = false;
      if (error.category === "validation") {
        for (const validationError of error.validationErrors ?? []) {
          if (validationError.field in EMPTY_VALUES) {
            setError(validationError.field as keyof FormValues, { type: "server", message: t("error.fieldInvalid") });
            mappedAny = true;
          }
        }
      }
      if (!mappedAny) {
        setBannerError(t("error.body"));
        requestAnimationFrame(() => errorRegionRef.current?.focus());
      }
    },
  });

  const submitting = isSubmitting || loading;

  function onValid(values: FormValues) {
    // `loading` already disables the button; this also covers a second
    // Enter keypress landing before React re-renders the disabled state.
    if (submitting) return;
    setBannerError(null);

    const body: CreateConsultationRequestInput = {
      name: values.name.trim(),
      phone: toLatinDigits(values.phone).trim(),
      intent: LECTURE_INTENT,
      // Lets staff see where this lead came from; the endpoint already
      // accepts free-text context here.
      message: `تسجيل للاستماع إلى محاضرة صوتية: ${lectureTitle}`,
    };
    submit(body);
  }

  return (
    <form onSubmit={handleSubmit(onValid)} noValidate className="flex flex-col gap-5" aria-busy={submitting}>
      {bannerError && (
        <div
          ref={errorRegionRef}
          tabIndex={-1}
          role="alert"
          className="rounded-xl border-hairline border-destructive bg-destructive/10 p-4 text-body-sm text-destructive focus:outline-none"
        >
          <p className="font-semibold">{t("error.heading")}</p>
          <p className="mt-1">{bannerError}</p>
        </div>
      )}

      <FormInput
        control={control}
        name="name"
        label={t("name")}
        placeholder={t("namePlaceholder")}
        type="text"
        autoComplete="name"
        rules={{
          validate: (value: string) => {
            const trimmed = value.trim();
            if (!trimmed) return t("validation.nameRequired");
            if (trimmed.length < 2) return t("validation.nameMinLength");
            return true;
          },
        }}
        disabled={submitting}
      />

      <FormInput
        control={control}
        name="phone"
        label={t("phone")}
        placeholder={t("phonePlaceholder")}
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        // Phone numbers read left-to-right even on an Arabic page ("+20 10…"
        // must not reorder), but the field still aligns with the RTL form.
        dir="ltr"
        className="[&_input]:text-end"
        rules={{
          validate: (value: string) => {
            const normalized = toLatinDigits(value).trim();
            if (!normalized) return t("validation.phoneRequired");
            if (!PHONE_PATTERN.test(normalized)) return t("validation.phoneInvalid");
            return true;
          },
        }}
        disabled={submitting}
      />

      <Button type="submit" size="lg" disabled={submitting} className="mt-1 w-full">
        {submitting ? t("submitting") : t("submit")}
      </Button>

      <p className="text-center text-caption text-text-secondary">{t("privacy")}</p>
    </form>
  );
}
