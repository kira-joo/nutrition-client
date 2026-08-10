"use client";

/**
 * The one boundary above everything else — catches an error the root
 * shell itself can't recover from (this app has no `src/app/layout.tsx`;
 * `src/app/[locale]/layout.tsx` is what renders `<html>`/`<body>`, so a
 * failure there has no other layout to bubble to). `src/app/[locale]/
 * error.tsx` explicitly does not cover this case — its own doc comment
 * says so — which left this as a real, unfilled gap: without this file,
 * a root-layout failure fell through to Next's own unstyled default error
 * page instead of anything belonging to this site.
 *
 * Deliberately minimal and self-contained: this must render even when
 * the thing that broke is the app shell itself, so it renders its own
 * `<html>`/`<body>` and does not depend on next-intl, Tailwind's compiled
 * theme, or any CMS-backed component that could be part of what's
 * actually failing. Plain inline styles, hardcoded bilingual copy (no
 * `useTranslations` — the locale/message-loading machinery is exactly the
 * kind of thing that could be implicated in a root-layout failure).
 */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html>
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem", padding: "2rem", textAlign: "center", maxWidth: "28rem" }}>
          <p style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0 }}>Something went wrong. / حدث خطأ ما.</p>
          <p style={{ color: "#666", margin: 0 }}>Please try again. / يرجى المحاولة مرة أخرى.</p>
          <button
            onClick={reset}
            style={{ marginTop: "0.5rem", padding: "0.625rem 1.5rem", borderRadius: "9999px", border: "none", background: "#0f766e", color: "white", fontWeight: 600, cursor: "pointer" }}
          >
            Try again / إعادة المحاولة
          </button>
        </div>
      </body>
    </html>
  );
}
