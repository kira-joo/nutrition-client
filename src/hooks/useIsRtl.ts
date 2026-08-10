"use client";
import { useLocale } from "next-intl";
import { Locale } from "@/constant/Locale.enum";

/**
 * Replaces `useRTL()` (deleted) for the small number of components whose
 * RTL handling is genuine layout logic (flex order, icon mirroring) rather
 * than simple positioning — those use CSS logical properties directly
 * (insetInlineStart/End, textAlign: "start") and need no hook at all. See
 * docs/architecture.md ("Localization & RTL") for which is which.
 *
 * The locale route segment (via next-intl's `useLocale()`) is now the only
 * source this reads from — not MUI theme direction, not i18next.
 */
export const useIsRtl = (): boolean => useLocale() === Locale.AR;
