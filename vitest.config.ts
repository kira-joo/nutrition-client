import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  // tsconfig.json sets `jsx: "preserve"` because Next.js's own compiler does the
  // JSX transform; esbuild has no such compiler here, so it must be told
  // explicitly to use the automatic runtime instead of leaving JSX untouched.
  esbuild: {
    jsx: "automatic",
  },
  resolve: {
    // This app imports through the `@/*` alias that tsconfig declares. Vite does
    // not read tsconfig paths, so without this every `@/lib/...` import fails to
    // resolve and the failure looks like a missing module rather than a missing
    // config line.
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
  },
});
