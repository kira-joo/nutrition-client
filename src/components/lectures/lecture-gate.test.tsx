import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AppError } from "@kira-joo/frontend-toolkit-core";
import messages from "@/i18n/locales/ar/lectures.json";
import { ConsultationRequestIntent, type CreateConsultationRequestInput } from "@/lib/domain/consultation-request";
import { LECTURE_REGISTRATION_STORAGE_KEY } from "@/lib/lectures/lecture-registration-storage";
import { LectureGate } from "./lecture-gate";

/**
 * The real gate, form and player against a faked `useConsultationRequest` —
 * the hook is the seam where the existing endpoint is reached, so faking it
 * lets each test decide whether the backend accepted the visitor and assert
 * exactly what would have been sent.
 */
let hookOptions: { onSuccess?: () => void; onError?: (error: AppError) => void };
const submit = vi.fn<(body: CreateConsultationRequestInput) => void>();
let loading = false;

vi.mock("@/lib/mutations/use-consultation-request", () => ({
  useConsultationRequest: (options: typeof hookOptions) => {
    hookOptions = options;
    return { submit, submitAsync: vi.fn(), loading, isSuccess: false };
  },
}));

// `Button` imports next-intl's navigation `Link`, whose `next/navigation`
// import vitest cannot resolve; nothing here renders a link.
vi.mock("@/i18n/navigation", () => ({ Link: "a" }));

const AUDIO_SRC = "/audio/lectures/test.mp3";

function renderGate() {
  return render(
    <NextIntlClientProvider locale="ar" messages={{ lectures: messages }}>
      <LectureGate title="محاضرة تجريبية" audioSrc={AUDIO_SRC} />
    </NextIntlClientProvider>,
  );
}

function fill(name: string, phone: string) {
  fireEvent.change(screen.getByLabelText(messages.gate.name, { exact: false }), { target: { value: name } });
  fireEvent.change(screen.getByLabelText(messages.gate.phone, { exact: false }), { target: { value: phone } });
  fireEvent.click(screen.getByRole("button", { name: messages.gate.submit }));
}

const audioElement = () => document.querySelector("audio");

beforeEach(() => {
  submit.mockReset();
  loading = false;
  window.localStorage.clear();
});

afterEach(() => {
  window.localStorage.clear();
});

describe("LectureGate", () => {
  it("shows the registration form, not the audio, to a new visitor", () => {
    renderGate();
    expect(screen.getByRole("heading", { name: messages.gate.heading })).toBeInTheDocument();
    expect(audioElement()).toBeNull();
  });

  it("requires both name and phone before calling the endpoint", async () => {
    renderGate();
    fireEvent.click(screen.getByRole("button", { name: messages.gate.submit }));
    expect(await screen.findByText(messages.gate.validation.nameRequired)).toBeInTheDocument();
    expect(await screen.findByText(messages.gate.validation.phoneRequired)).toBeInTheDocument();
    expect(submit).not.toHaveBeenCalled();
  });

  it("sends the existing endpoint's contract, with Arabic digits normalised", async () => {
    renderGate();
    fill("  منى  ", "٠١٠١٢٣٤٥٦٧٨");
    await waitFor(() => expect(submit).toHaveBeenCalledTimes(1));
    const body = submit.mock.calls[0][0];
    expect(body).toMatchObject({
      name: "منى",
      phone: "01012345678",
      intent: ConsultationRequestIntent.NEWSLETTER,
    });
    expect(body.message).toContain("محاضرة تجريبية");
    expect(Object.keys(body).sort()).toEqual(["intent", "message", "name", "phone"]);
  });

  it("unlocks the lecture and remembers it only after the endpoint succeeds", async () => {
    renderGate();
    fill("منى", "01012345678");
    await waitFor(() => expect(submit).toHaveBeenCalled());
    expect(audioElement()).toBeNull();
    expect(window.localStorage.getItem(LECTURE_REGISTRATION_STORAGE_KEY)).toBeNull();

    act(() => hookOptions.onSuccess?.());

    expect(audioElement()).toHaveAttribute("src", AUDIO_SRC);
    expect(window.localStorage.getItem(LECTURE_REGISTRATION_STORAGE_KEY)).not.toBeNull();
  });

  it("keeps the lecture locked and shows an error when the endpoint fails", async () => {
    renderGate();
    fill("منى", "01012345678");
    await waitFor(() => expect(submit).toHaveBeenCalled());

    act(() => hookOptions.onError?.({ category: "network", message: "Network Error" } as AppError));

    expect(await screen.findByRole("alert")).toHaveTextContent(messages.gate.error.body);
    expect(audioElement()).toBeNull();
    expect(window.localStorage.getItem(LECTURE_REGISTRATION_STORAGE_KEY)).toBeNull();
  });

  it("disables the submit button while the request is pending", () => {
    loading = true;
    renderGate();
    expect(screen.getByRole("button", { name: messages.gate.submitting })).toBeDisabled();
  });

  it("skips the form for a returning visitor in the same browser", () => {
    window.localStorage.setItem(LECTURE_REGISTRATION_STORAGE_KEY, String(Date.now()));
    renderGate();
    expect(screen.queryByRole("heading", { name: messages.gate.heading })).toBeNull();
    expect(audioElement()).toHaveAttribute("src", AUDIO_SRC);
  });

  it("renders no native controls on the audio element", () => {
    window.localStorage.setItem(LECTURE_REGISTRATION_STORAGE_KEY, String(Date.now()));
    renderGate();
    expect(audioElement()).not.toHaveAttribute("controls");
    expect(screen.queryByRole("link")).toBeNull();
  });
});
