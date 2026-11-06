/**
 * `m:ss`, or `h:mm:ss` once the media is an hour or longer. Pass the total
 * duration as `reference` so the current time uses the same shape as the
 * duration beside it (`0:05:12 / 1:05:21`, not `5:12 / 1:05:21`).
 * Non-finite input (metadata not loaded yet) renders as `0:00`.
 */
export function formatMediaTime(seconds: number, reference = seconds): string {
  const safe = Number.isFinite(seconds) && seconds > 0 ? Math.floor(seconds) : 0;
  const withHours = Number.isFinite(reference) && reference >= 3600;
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  const s = safe % 60;
  const ss = String(s).padStart(2, "0");
  if (withHours) return `${h}:${String(m).padStart(2, "0")}:${ss}`;
  return `${h * 60 + m}:${ss}`;
}

const ARABIC_INDIC_ZERO = 0x0660;
const EXTENDED_ARABIC_INDIC_ZERO = 0x06f0;

/**
 * Arabic phone keyboards commonly type ٠١٢…٩ (or the Persian-extended ۰۱۲…۹).
 * `\d` and the backend only understand ASCII digits, so normalise before
 * validating and before sending.
 */
export function toLatinDigits(value: string): string {
  return value.replace(/[٠-٩۰-۹]/g, (char) => {
    const code = char.charCodeAt(0);
    const base = code >= EXTENDED_ARABIC_INDIC_ZERO ? EXTENDED_ARABIC_INDIC_ZERO : ARABIC_INDIC_ZERO;
    return String(code - base);
  });
}
