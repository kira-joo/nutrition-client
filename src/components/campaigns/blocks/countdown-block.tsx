"use client";
import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { APP_TIMEZONE } from "@/lib/config/app-timezone.constant";
import type { LocalizedCountdownBlock } from "@/lib/domain/campaign";

export interface CountdownBlockProps {
  block: LocalizedCountdownBlock;
}

interface Remaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

/**
 * `targetDate` is always a full ISO-8601 UTC instant (confirmed against the
 * real API — the CMS date picker converts a Cairo wall-clock entry to the
 * true UTC instant at authoring time), so this comparison needs no
 * timezone awareness at all: it's correct in any visitor's local timezone
 * by construction. `NaN` (a malformed value slipping past backend
 * validation) is treated the same as already-expired rather than rendering
 * literal "NaN" in the UI.
 */
function getRemaining(targetMs: number): Remaining | null {
  const diffMs = targetMs - Date.now();
  if (!Number.isFinite(diffMs) || diffMs <= 0) return null;

  const totalSeconds = Math.floor(diffMs / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

/**
 * Ticks every second on the client only. The initial render (server, and
 * the client's first paint before hydration) shows the heading and the
 * static "ends on" date but leaves the ticking numbers empty — computing
 * them from `Date.now()` during SSR would embed the server's render-time
 * instant into the HTML, which almost never matches the client's
 * hydration-time instant by however long the response took to arrive, a
 * guaranteed hydration mismatch. `useEffect` only runs post-hydration, so
 * the first real value is always computed client-side.
 */
export function CountdownBlock({ block }: CountdownBlockProps) {
  const t = useTranslations("campaigns");
  const locale = useLocale();
  const targetMs = new Date(block.targetDate).getTime();

  const [remaining, setRemaining] = useState<Remaining | null | undefined>(undefined);
  // `Intl.DateTimeFormat("ar", ...)` isn't guaranteed to render byte-identical
  // output between Node's ICU (server render) and the browser's ICU
  // (hydration) — measured directly: it produced a real hydration mismatch
  // (React error #418) on Arabic specifically, never on English. Computed
  // only client-side, after hydration, alongside the countdown tick itself,
  // rather than in the shared server/client render path.
  const [endsOnDate, setEndsOnDate] = useState<string | undefined>(undefined);

  useEffect(() => {
    setRemaining(getRemaining(targetMs));
    setEndsOnDate(new Intl.DateTimeFormat(locale, { timeZone: APP_TIMEZONE, dateStyle: "long", timeStyle: "short" }).format(targetMs));
    const interval = setInterval(() => setRemaining(getRemaining(targetMs)), 1000);
    return () => clearInterval(interval);
  }, [targetMs, locale]);

  const expiredLabel = block.expiredLabel || t("countdown.expiredFallback");

  return (
    <div className="flex flex-col items-center gap-4 py-4 text-center">
      <h2 className="text-heading-1 font-bold text-text-primary">{block.heading}</h2>
      {/*
        Fixed to the clinic's own timezone regardless of the visitor's
        device: the admin who authored this date meant one specific Cairo
        wall-clock moment, and every visitor should read the same deadline
        rather than a value that silently shifts with their own browser's
        timezone. Empty until the client effect above fills it in.
      */}
      <p className="min-h-[1.5em] text-body text-text-secondary">{endsOnDate && t("countdown.endsOn", { date: endsOnDate })}</p>

      {/*
        `aria-live` wraps only the counting <-> expired state change, never
        the per-second tick — announcing "9 seconds, 8 seconds, 7
        seconds..." would be unusable with a screen reader. The numeric
        tiles below are marked `aria-hidden`: the "ends on" text above
        already gives the actual deadline accessibly, and a live countdown
        display is a visual enhancement layered on top of it, not the only
        source of that information.
      */}
      <div aria-live="polite" className="min-h-[5.5rem]">
        {remaining === undefined ? null : remaining === null ? (
          <p className="text-heading-2 font-bold text-text-primary">{expiredLabel}</p>
        ) : (
          <div aria-hidden="true" className="flex gap-3 sm:gap-5">
            <CountdownUnit value={remaining.days} label={t("countdown.units.days")} />
            <CountdownUnit value={remaining.hours} label={t("countdown.units.hours")} />
            <CountdownUnit value={remaining.minutes} label={t("countdown.units.minutes")} />
            <CountdownUnit value={remaining.seconds} label={t("countdown.units.seconds")} />
          </div>
        )}
      </div>
    </div>
  );
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex w-16 flex-col items-center gap-1 rounded-xl bg-surface-muted py-3 sm:w-20">
      <span className="text-heading-1 font-extrabold tabular-nums text-primary">{String(value).padStart(2, "0")}</span>
      <span className="text-caption uppercase tracking-wide text-text-muted">{label}</span>
    </div>
  );
}
