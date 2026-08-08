"use client";
import type { ReactNode } from "react";
import { useScrollReveal, type UseScrollRevealOptions } from "@/lib/animation/use-scroll-reveal";
import { useStaggerReveal, type UseStaggerRevealOptions } from "@/lib/animation/use-stagger-reveal";

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

export interface RevealGroupProps extends UseStaggerRevealOptions {
  className?: string;
  children: ReactNode;
  /** The container element — `ol`/`ul` for a real list of items, `div` (the default) otherwise. */
  as?: "div" | "ol" | "ul";
}

/**
 * `Reveal` for a list: wrap the grid/list container itself (not each
 * item) so the whole group shares one ScrollTrigger and staggers in
 * together via `useStaggerReveal`, instead of every item owning an
 * independent trigger plus a hand-computed `delay={index * 0.08}` — see
 * that hook's doc comment for why the per-item version is pure added
 * latency on a single-column mobile layout. Children render as plain
 * elements; this only needs to be able to read `container.children`.
 */
export function RevealGroup({ className, children, as: Tag = "div", ...options }: RevealGroupProps) {
  const ref = useStaggerReveal<HTMLElement>(options);
  return (
    <Tag ref={ref as never} className={className}>
      {children}
    </Tag>
  );
}
