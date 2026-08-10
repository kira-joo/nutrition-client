"use client";
import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { RotateCcw } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";

export interface RouteErrorProps {
  error: Error & { digest?: string };
  /** Next's segment-level retry — re-renders the boundary's subtree, which re-runs the failed fetch. */
  reset: () => void;
}

/**
 * The shared body of every route's `error.tsx`, so each route file stays a
 * two-line wrapper instead of duplicating this markup nine times.
 *
 * `reset()` is wired to a real button rather than telling the visitor to
 * refresh: §17 requires an actual retry action, and re-rendering the
 * segment genuinely re-runs the fetch that failed. The error message itself
 * is never shown — it's a server-side fetch failure, meaningless and
 * potentially revealing to a visitor — but it is logged so the digest stays
 * traceable.
 */
export function RouteError({ error, reset }: RouteErrorProps) {
  const t = useTranslations("layout");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Section>
      <Container width="narrow" className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-heading-1 font-bold text-text-primary">{t("error.heading")}</h1>
        <p className="text-body text-text-secondary">{t("error.body")}</p>
        <Button onClick={reset} className="mt-2">
          <RotateCcw className="size-icon-sm" aria-hidden="true" />
          {t("error.retry")}
        </Button>
      </Container>
    </Section>
  );
}
