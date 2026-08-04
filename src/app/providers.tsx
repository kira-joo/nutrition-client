"use client";
import { ToolkitProviders, createToolkitQueryClient } from "@kira-joo/frontend-toolkit-core";
import { useState } from "react";
import { configureApiClient } from "@/lib/api/api-config";

configureApiClient();

/**
 * React Query context for client-side calls (currently just the
 * consultation-request mutation). Deliberately NOT used for the 8 read
 * domains — those fetch server-side and reach the browser as already-
 * rendered HTML, never as a client-side query. See docs/architecture.md
 * ("Public data flow").
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => createToolkitQueryClient());
  return <ToolkitProviders client={client}>{children}</ToolkitProviders>;
}
