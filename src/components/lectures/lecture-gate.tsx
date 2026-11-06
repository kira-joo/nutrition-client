"use client";
import { useRef, useState, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { hasLectureRegistration, rememberLectureRegistration } from "@/lib/lectures/lecture-registration-storage";
import { LectureRegistrationForm } from "./lecture-registration-form";
import { LectureAudioPlayer } from "./lecture-audio-player";

const noopSubscribe = () => () => {};
/** `null` on the server and during hydration — "not known yet", rendered as the neutral placeholder. */
const getServerSnapshot = () => null;

export interface LectureGateProps {
  title: string;
  audioSrc: string;
}

/**
 * The player — and with it the audio URL — only mounts after a successful
 * registration (now, or remembered from an earlier visit in this browser).
 *
 * The browser flag is read through `useSyncExternalStore` with a `null`
 * server snapshot, so server and hydration render the same neutral
 * placeholder and the real value applies right after — a returning visitor
 * never sees a flash of the form.
 */
export function LectureGate({ title, audioSrc }: LectureGateProps) {
  const t = useTranslations("lectures.gate");
  const remembered = useSyncExternalStore(noopSubscribe, hasLectureRegistration, getServerSnapshot);
  const [registeredNow, setRegisteredNow] = useState(false);
  const playerRegionRef = useRef<HTMLDivElement>(null);
  const state = registeredNow || remembered === true ? "unlocked" : remembered === null ? "checking" : "locked";

  function onRegistered() {
    rememberLectureRegistration();
    setRegisteredNow(true);
    // The form (and its focused submit button) just vanished — land focus on
    // the player so keyboard and screen-reader users continue from there.
    requestAnimationFrame(() => playerRegionRef.current?.focus());
  }

  if (state === "checking") {
    return (
      <div
        role="status"
        className="flex min-h-64 items-center justify-center rounded-xl border-hairline border-border bg-surface shadow-md"
      >
        <span className="text-body-sm text-text-secondary">{t("checking")}</span>
      </div>
    );
  }

  if (state === "unlocked") {
    return (
      <div ref={playerRegionRef} tabIndex={-1} className="focus:outline-none">
        <LectureAudioPlayer src={audioSrc} title={title} />
      </div>
    );
  }

  return (
    <section
      aria-labelledby="lecture-gate-heading"
      className="rounded-xl border-hairline border-border bg-surface p-5 shadow-md sm:p-8"
    >
      <h2 id="lecture-gate-heading" className="text-heading-3 font-bold text-text-primary">
        {t("heading")}
      </h2>
      <p className="mt-2 text-body-sm text-text-secondary">{t("body")}</p>
      <div className="mt-6">
        <LectureRegistrationForm lectureTitle={title} onRegistered={onRegistered} />
      </div>
    </section>
  );
}
