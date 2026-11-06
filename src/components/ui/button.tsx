import type { ButtonHTMLAttributes, ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Link } from "@/i18n/navigation";

export type ButtonVariant = "primary" | "secondary" | "soft" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

/**
 * `primary`/`secondary`/`ghost` map directly onto docs/design-system.md's
 * card/surface families: `primary` is the deep-filled emphasis treatment
 * (so it always pairs with the dual-layer `.focus-ring-on-dark` rule from
 * globals.css — the default `:focus-visible` ring alone doesn't read
 * against a filled `primary`/`accent` background), `secondary` is
 * soft-paper, `ghost` is borderless. `soft` is a fourth, deliberately
 * lighter-weight variant for a secondary navigational action that still
 * needs real brand-color presence at rest (e.g. a section's "View all")
 * — an opaque `bg-surface` pill (not `bg-primary-soft`) so it reads
 * clearly against every section background this sits on, including the
 * sections that themselves use `bg-primary-soft` or `bg-surface-muted`,
 * with accent-colored text/border at rest and the same solid fill as
 * `primary` on hover.
 */
/**
 * Every hover state is `pointer:hover:`, never bare `hover:`.
 *
 * A bare `:hover` latches on a touch device: it applies on tap and stays until
 * something else is tapped, so a visitor who taps a CTA and scrolls on leaves a
 * button behind that looks permanently hovered. `pointer:` scopes it to
 * `(hover: hover) and (pointer: fine)`. This was a recorded defect on `primary`
 * and `soft`; `secondary` and `ghost` had it too, since a latched colour change
 * is the same bug as a latched elevation.
 *
 * `primary` also lifts, which is the closing CTA's attention cue and the same
 * layer-4 gesture the cards use — deliberately not a continuous pulse, because
 * `docs/motion-system.md` restricts ambient motion to decorative surfaces and a
 * CTA carries information.
 */
const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-white shadow-md focus-ring-on-dark pointer:hover:bg-primary-hover pointer:hover:shadow-raised pointer:hover:-translate-y-0.5",
  secondary:
    "bg-surface text-text-primary border-hairline border-border pointer:hover:border-primary pointer:hover:text-primary",
  soft: "bg-surface text-primary shadow-sm border-hairline border-primary/25 pointer:hover:bg-primary pointer:hover:text-white pointer:hover:border-primary pointer:hover:shadow-md",
  ghost: "bg-transparent text-text-primary pointer:hover:text-primary",
};

const SIZE_CLASS: Record<ButtonSize, string> = {
  sm: "h-control-sm px-4 text-body-sm",
  md: "h-control-md px-6 text-button",
  lg: "h-control-lg px-8 text-button",
};

/**
 * `active:scale-[0.98]` is not decoration — it is the only press feedback a
 * touch device gets once hover is correctly scoped to fine pointers. Before
 * this, a latched `:hover` was accidentally standing in for "pressed", badly:
 * it arrived on tap and then never left. `:active` is the state that actually
 * means pressed, and it works for a mouse too.
 *
 * The transition names its properties explicitly because `transition-colors`
 * alone left `primary`'s shadow change snapping instantly. The transform is
 * ungated with only its transition behind `motion-safe:` — layer 4 "keeps its
 * outcome but loses its transition", so under `reduce` a press still registers,
 * it just arrives immediately. The duration and ease are restated under the same
 * variant because every Tailwind `transition-*` utility rewrites both with its
 * own 150ms default.
 */
const BASE_CLASS =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold " +
  "transition-[color,background-color,border-color,box-shadow] duration-base ease-standard " +
  "motion-safe:transition-[color,background-color,border-color,box-shadow,transform] motion-safe:duration-base motion-safe:ease-standard " +
  "active:scale-[0.98] " +
  "disabled:cursor-not-allowed disabled:bg-disabled-bg disabled:text-disabled-text disabled:shadow-none disabled:border-transparent";

interface CommonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
}

type ButtonAsButton = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> & { href?: undefined };

type ButtonAsLink = CommonProps &
  Omit<ComponentPropsWithoutRef<typeof Link>, "className" | "children"> & {
    href: ComponentPropsWithoutRef<typeof Link>["href"];
    external?: false;
  };

/**
 * A CMS-authored CTA URL (campaigns) can point off-site — routing that
 * through `Link` would wrongly prepend the locale prefix to a full URL.
 * `external: true` is the one escape hatch to a real `<a target="_blank">`
 * with correct `rel`, still styled identically to every other Button.
 */
type ButtonAsExternalLink = CommonProps &
  Omit<ComponentPropsWithoutRef<"a">, "className" | "children" | "href" | "target" | "rel"> & {
    href: string;
    external: true;
  };

export type ButtonProps = ButtonAsButton | ButtonAsLink | ButtonAsExternalLink;

/**
 * Renders a locale-aware `Link` when `href` is given, a real external `<a>`
 * when `href` is given with `external: true`, a native `<button>` otherwise
 * — every CTA/nav action in the app goes through this one component instead
 * of ad hoc `<a>`/`<button>` markup, so the visual language and focus-ring
 * behavior stay consistent everywhere.
 */
export function Button({ variant = "primary", size = "md", className, children, ...props }: ButtonProps) {
  const classes = cn(BASE_CLASS, VARIANT_CLASS[variant], SIZE_CLASS[size], className);

  if ("href" in props && props.href !== undefined) {
    if ("external" in props && props.external) {
      const { href, external: _external, ...anchorProps } = props as ButtonAsExternalLink;
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={classes} {...anchorProps}>
          {children}
        </a>
      );
    }

    const { href, external: _external, ...linkProps } = props as ButtonAsLink;
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
