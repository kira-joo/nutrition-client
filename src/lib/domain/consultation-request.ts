export enum ConsultationRequestIntent {
  CONSULTATION = "consultation",
  PACKAGE_INQUIRY = "package_inquiry",
  NEWSLETTER = "newsletter",
}

/**
 * Mirrors nutrition-staff's `CreateConsultationRequestDto` — the request
 * body every consultation/contact/package-inquiry form sends to this
 * app's own `/api/consultation-requests` proxy (never to nutrition-staff
 * directly; see docs/architecture.md).
 */
export interface CreateConsultationRequestInput {
  name: string;
  phone: string;
  email?: string;
  intent: ConsultationRequestIntent;
  message?: string;
  packageKey?: string;
  /** Honeypot — must always be sent empty by real form UI. */
  website?: string;
  /** `Date.now()`-equivalent captured when the form rendered, forwarded verbatim for the backend's minimum-time-to-submit check. */
  formRenderedAt?: string;
}

export interface ConsultationRequestResult {
  success: true;
}
