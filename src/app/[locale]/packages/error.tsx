"use client";
import { RouteError, type RouteErrorProps } from "@/components/ui/route-error";

export default function PackagesError(props: RouteErrorProps) {
  return <RouteError {...props} />;
}
