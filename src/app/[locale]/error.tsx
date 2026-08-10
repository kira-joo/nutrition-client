"use client";
import { RouteError, type RouteErrorProps } from "@/components/ui/route-error";

/**
 * One error boundary for every route under `[locale]`. Next bubbles an
 * error to the nearest ancestor `error.tsx`, so nested routes need their
 * own file only when they genuinely require different recovery UX,
 * messaging, or actions — not to forward the same props.
 *
 * Does not cover `[locale]/layout.tsx` itself (a segment's boundary never
 * catches its own layout); the shell's CMS reads are wrapped in their own
 * try/catch there and degrade to a functional fallback shell instead.
 */
export default function LocaleError(props: RouteErrorProps) {
  return <RouteError {...props} />;
}
