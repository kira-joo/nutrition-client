"use client";
import { RouteError, type RouteErrorProps } from "@/components/ui/route-error";

export default function DoctorError(props: RouteErrorProps) {
  return <RouteError {...props} />;
}
