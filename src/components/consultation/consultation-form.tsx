"use client";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { FormInput, FormTextarea } from "@kira-joo/frontend-toolkit-tailwind/forms";
import type { AppError } from "@kira-joo/frontend-toolkit-core";
import { useConsultationRequest } from "@/lib/mutations/use-consultation-request";
import { ConsultationRequestIntent, type CreateConsultationRequestInput } from "@/lib/domain/consultation-request";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";

export interface ConsultationFormProps {
  doctorName: string;
  /** Only ever set once a real, currently-published package was matched server-side — never a raw, unverified query param. */
  packageKey?: string;
  packageName?: string;
  /** From real Site Settings — undefined when the clinic hasn't configured one, in which case the WhatsApp continuation simply doesn't render. */
  whatsappNumber?: string;
}

interface FormValues {
  name: string;
  phone: string;
  email: string;
  message: string;
  /** Honeypot — a real visitor never sees or fills this; see the field's own render below. */
  website: string;
}

const EMPTY_VALUES: FormValues = { name: "", phone: "", email: "", message: "", website: "" };

/**
 * Every field here exists in nutrition-staff's real `CreateConsultationRequestDto`
 * (`name/phone/email/intent/message/packageKey` plus the `website` honeypot
 * and `formRenderedAt` anti-spam fields) — no biometric/lifestyle/medical
 * fields the legacy form invented but never actually sent anywhere. That
 * expectation-setting content still matters to the clinic; it lives as real
 * copy in the trust panel next to this form, not as fields this DTO can't
 * carry.
 *
 * Submission goes through the app's own `useConsultationRequest` hook
 * (already built in an earlier phase on `frontend-toolkit-core`'s
 * `useRequesterMutation`, itself posting to this app's same-origin
 * `/api/consultation-requests` proxy — never nutrition-staff directly).
 * Field rendering uses the toolkit's own `FormInput`/`FormTextarea`
 * (`@kira-joo/frontend-toolkit-tailwind/forms`) for label association,
 * error display, and required-field semantics, rather than hand-rolled
 * input markup.
 */
export function ConsultationForm({ doctorName, packageKey, packageName, whatsappNumber }: ConsultationFormProps) {
  const t = useTranslations("consultation");

  // Captured once, at mount — forwarded verbatim so the backend's
  // minimum-time-to-submit anti-spam check has a real render timestamp,
  // not a timestamp read at submit time (which would defeat the check).
  const formRenderedAt = useRef(new Date().toISOString());
  const submittedValuesRef = useRef<FormValues>(EMPTY_VALUES);
  const errorRegionRef = useRef<HTMLDivElement>(null);
  const successHeadingRef = useRef<HTMLHeadingElement>(null);

  const [phase, setPhase] = useState<"form" | "success">("form");
  const [successValues, setSuccessValues] = useState<FormValues>(EMPTY_VALUES);
  const [bannerError, setBannerError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    register,
    setError,
    formState: { isSubmitting },
  } = useForm<FormValues>({ defaultValues: EMPTY_VALUES, mode: "onBlur" });

  const { submit, loading } = useConsultationRequest({
    onSuccess: () => {
      setBannerError(null);
      setSuccessValues(submittedValuesRef.current);
      setPhase("success");
      // Moves focus to the confirmation heading so it's announced and the
      // visitor lands somewhere meaningful rather than on a now-vanished
      // submit button.
      requestAnimationFrame(() => successHeadingRef.current?.focus());
    },
    onError: (error: AppError) => {
      if (error.category === "validation" && error.validationErrors?.length) {
        let mappedAny = false;
        for (const validationError of error.validationErrors) {
          if (validationError.field in EMPTY_VALUES) {
            setError(validationError.field as keyof FormValues, { type: "server", message: validationError.message });
            mappedAny = true;
          }
        }
        // A validation error the backend attributed to a field this form
        // doesn't have (e.g. an internal-only field) still needs to be
        // visible somewhere rather than silently swallowed.
        if (!mappedAny) setBannerError(error.message);
      } else {
        setBannerError(error.message || t("error.body"));
      }
      requestAnimationFrame(() => errorRegionRef.current?.focus());
    },
  });

  function onValid(values: FormValues) {
    submittedValuesRef.current = values;
    setBannerError(null);

    const body: CreateConsultationRequestInput = {
      name: values.name.trim(),
      phone: values.phone.trim(),
      email: values.email.trim() || undefined,
      message: values.message.trim() || undefined,
      intent: packageKey ? ConsultationRequestIntent.PACKAGE_INQUIRY : ConsultationRequestIntent.CONSULTATION,
      packageKey,
      website: values.website,
      formRenderedAt: formRenderedAt.current,
    };
    submit(body);
  }

  if (phase === "success") {
    const whatsappHref = whatsappNumber
      ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
          successValues.message ? `${successValues.name}: ${successValues.message}` : `${successValues.name}`,
        )}`
      : undefined;

    return (
      <Reveal
        className="flex flex-col items-center gap-4 rounded-2xl bg-surface p-8 text-center shadow-md"
        direction="none"
      >
        {/* tabIndex so focus can land here programmatically; not a tab stop otherwise. */}
        <h2
          ref={successHeadingRef}
          tabIndex={-1}
          className="text-heading-1 font-bold text-text-primary focus:outline-none"
        >
          {t("success.heading")}
        </h2>
        <p className="text-body text-text-secondary">{t("success.body", { name: successValues.name, doctorName })}</p>

        {whatsappHref && (
          <div className="mt-2 flex flex-col items-center gap-2">
            <Button href={whatsappHref} external variant="primary">
              {t("success.whatsappCta")}
            </Button>
            <p className="text-caption text-text-muted">{t("success.whatsappHint")}</p>
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            setPhase("form");
            setSuccessValues(EMPTY_VALUES);
          }}
          className="mt-2 text-body-sm font-semibold text-primary hover:underline"
        >
          {t("success.another")}
        </button>
      </Reveal>
    );
  }

  const submitting = isSubmitting || loading;

  return (
    <form onSubmit={handleSubmit(onValid)} noValidate className="flex flex-col gap-5">
      {bannerError && (
        // `tabIndex={-1}` + a ref lets focus move here programmatically;
        // `role="alert"` (implicit via aria-live="assertive") means a
        // screen reader announces it the moment it appears, without
        // needing focus to already be inside it.
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
        label={t("form.name")}
        placeholder={t("form.namePlaceholder")}
        type="text"
        rules={{
          required: t("form.validation.nameRequired"),
          minLength: { value: 2, message: t("form.validation.nameMinLength") },
        }}
        disabled={submitting}
      />

      <FormInput
        control={control}
        name="phone"
        label={t("form.phone")}
        placeholder={t("form.phonePlaceholder")}
        type="tel"
        rules={{
          required: t("form.validation.phoneRequired"),
          pattern: { value: /^[\d+\s-]{7,20}$/, message: t("form.validation.phoneInvalid") },
        }}
        disabled={submitting}
      />

      <FormInput
        control={control}
        name="email"
        label={t("form.emailOptional")}
        placeholder={t("form.emailPlaceholder")}
        type="email"
        rules={{ pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: t("form.validation.emailInvalid") } }}
        disabled={submitting}
      />

      {packageName && (
        <p className="rounded-lg bg-primary-soft px-4 py-2.5 text-body-sm font-medium text-primary">
          {t("packageContext", { packageName })}
        </p>
      )}

      <FormTextarea
        control={control}
        name="message"
        label={t("form.messageOptional")}
        placeholder={t("form.messagePlaceholder")}
        rows={4}
        disabled={submitting}
      />

      {/*
        Honeypot: a real visitor never encounters this field (visually
        hidden, aria-hidden, not a tab stop) — a bot that blindly fills
        every input it finds in the DOM does, and the backend rejects any
        submission where this arrives non-empty. Plain `register`, not
        `FormInput`: it needs no label, no error display, no visible
        wrapper at all. `sr-only`, not `absolute -left-[9999px]`: the
        latter has no positioned ancestor here, so it resolved against the
        initial containing block and created a real ~9999px scrollable
        region — worst in RTL, where leftward is the scroll direction.
        `sr-only` hides the same way without displacing anything.
      */}
      <div aria-hidden="true" className="sr-only">
        <label htmlFor="website">Website</label>
        <input id="website" type="text" tabIndex={-1} autoComplete="off" {...register("website")} />
      </div>

      <Button type="submit" disabled={submitting} className="mt-2 w-full sm:w-auto sm:self-start">
        {submitting ? t("form.submitting") : t("form.submit")}
      </Button>
    </form>
  );
}
