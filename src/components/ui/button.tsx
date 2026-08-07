import type { ButtonHTMLAttributes, ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Link } from "@/i18n/navigation";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

/**
 * The three variants map directly onto docs/design-system.md's card/surface
 * families: `primary` is the deep-filled emphasis treatment (so it always
 * pairs with the dual-layer `.focus-ring-on-dark` rule from globals.css —
 * the default `:focus-visible` ring alone doesn't read against a filled
 * `primary`/`accent` background), `secondary` is soft-paper, `ghost` is
 * borderless.
 */
const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: "bg-primary text-white hover:bg-primary-hover shadow-md hover:shadow-raised focus-ring-on-dark",
  secondary: "bg-surface text-text-primary border-hairline border-border hover:border-primary hover:text-primary",
  ghost: "bg-transparent text-text-primary hover:text-primary",
};

const SIZE_CLASS: Record<ButtonSize, string> = {
  sm: "h-control-sm px-4 text-body-sm",
  md: "h-control-md px-6 text-button",
  lg: "h-control-lg px-8 text-button",
};

const BASE_CLASS =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors duration-base ease-standard disabled:cursor-not-allowed disabled:bg-disabled-bg disabled:text-disabled-text disabled:shadow-none disabled:border-transparent";

interface CommonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
}

type ButtonAsButton = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> & { href?: undefined };

type ButtonAsLink = CommonProps &
  Omit<ComponentPropsWithoutRef<typeof Link>, "className" | "children"> & { href: ComponentPropsWithoutRef<typeof Link>["href"] };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

/**
 * Renders a locale-aware `Link` when `href` is given, a native `<button>`
 * otherwise — every CTA/nav action in the app goes through this one
 * component instead of ad hoc `<a>`/`<button>` markup, so the visual
 * language and focus-ring behavior stay consistent everywhere.
 */
export function Button({ variant = "primary", size = "md", className, children, ...props }: ButtonProps) {
  const classes = cn(BASE_CLASS, VARIANT_CLASS[variant], SIZE_CLASS[size], className);

  if ("href" in props && props.href !== undefined) {
    const { href, ...linkProps } = props as ButtonAsLink;
    return (
      <Link href={href} className={classes} {...linkProps}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...(props as ButtonAsButton)}>
      {children}
    </button>
  );
}
