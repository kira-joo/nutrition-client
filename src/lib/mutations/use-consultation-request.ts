"use client";
import { useRequesterMutation } from "@kira-joo/frontend-toolkit-core";
import { createConsultationRequestEndpoint } from "../../../api/consultation-requests.endpoints";
import { toAppError, type AppError } from "@/lib/api/error-model";
import type { CreateConsultationRequestInput } from "@/lib/domain/consultation-request";

interface UseConsultationRequestOptions {
  onSuccess?: () => void;
  /** Receives the normalized AppError, not the raw ApiError — components should never handle frontend-toolkit-core's shape directly, per the single error model this phase establishes. */
  onError?: (error: AppError) => void;
}

/**
 * The one client-side mutation this phase establishes — every
 * consultation/contact/package-inquiry form (built in a later phase) uses
 * this hook, submitting to this app's own proxy route (never
 * nutrition-staff directly). `loading`/`mutate` come straight from
 * `useRequesterMutation` (React Query under the hood, wired up via
 * src/app/providers.tsx) — this phase doesn't invent a parallel
 * loading-state mechanism.
 */
export function useConsultationRequest({ onSuccess, onError }: UseConsultationRequestOptions = {}) {
  const mutation = useRequesterMutation({
    endpoint: createConsultationRequestEndpoint,
    onSuccess,
    onError: (error) => {
      if (!onError) return;
      // useRequesterMutation's onError is synchronous, but toAppError is
      // async (normalizeApiError parses the response body) — fire and
      // forward rather than blocking the mutation's own error handling.
      void toAppError(error).then(onError);
    },
  });

  return {
    submit: (body: CreateConsultationRequestInput) => mutation.mutate({ body }),
    submitAsync: (body: CreateConsultationRequestInput) => mutation.mutateAsync({ body }),
    loading: mutation.loading,
    isSuccess: mutation.isSuccess,
  };
}
