"use client";
import { ToolkitProviders, createToolkitQueryClient } from "@kira-joo/frontend-toolkit-core";
import { DialogProvider } from "@kira-joo/frontend-toolkit-tailwind/dialog";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { configureApiClient } from "@/lib/api/api-config";
import "@/lib/datetime/configure-timezone";

configureApiClient();

/**
 * React Query context for client-side calls (currently just the
 * consultation-request mutation). Deliberately NOT used for the 8 read
 * domains — those fetch server-side and reach the browser as already-
 * rendered HTML, never as a client-side query. See docs/architecture.md
 * ("Public data flow").
 *
 * Also the app's dialog boundary. Every modal surface — the nav drawer, the
 * recipe filter sheet, the lightbox, the book reader's panels — registers with
 * the shared layer coordinator mounted here, which is what gives them one
 * Escape order, one reference-counted scroll lock, and correct stacking
 * instead of five independent copies of that logic.
 *
 * Renders inside `NextIntlClientProvider` (see the locale layout) on purpose:
 * the toolkit ships no copy of its own, so the labels come from this app's own
 * translations and are therefore correct in both locales for free.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => createToolkitQueryClient());
  const t = useTranslations("layout.dialog");

  const labels = useMemo(
    () => ({
      close: t("close"),
      confirm: t("confirm"),
      cancel: t("cancel"),
      save: t("save"),
      fallbackMessage: t("fallbackMessage"),
    }),
    [t]
  );

  return (
    <ToolkitProviders client={client}>
      {/* Layer range mirrors this app's own z-index tokens (globals.css):
          dialogs occupy the `--z-modal` band (60) and stay below `--z-toast`
          (70), so a toast raised from inside a dialog is still visible. Passed
          explicitly rather than relying on the package default happening to
          match — the app owns its stacking scale. */}
      <DialogProvider labels={labels} layers={{ base: 60, step: 2, max: 69 }}>
        {children}
      </DialogProvider>
    </ToolkitProviders>
  );
}
