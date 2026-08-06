"use client";
import type { ReactNode } from "react";
import { useScrollReveal, type UseScrollRevealOptions } from "@/lib/animation/use-scroll-reveal";

export interface RevealProps extends UseScrollRevealOptions {
  className?: string;
  children: ReactNode;
}

/** Thin JSX wrapper over `useScrollReveal` for the common case of animating one block on scroll-in, without every call site writing its own ref/effect boilerplate. */
export function Reveal({ className, children, ...options }: RevealProps) {
  const ref = useScrollReveal<HTMLDivElement>(options);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
