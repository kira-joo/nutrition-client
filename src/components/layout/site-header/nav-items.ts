import AppRoute from "@/constant/AppRoute.enum";

/**
 * The primary IA: Home / Doctor / Packages / Recipes visible on both
 * desktop and mobile, everything else tucked under "More" on desktop
 * (flattened into one list in the mobile drawer, where there's no room
 * for a nested disclosure). Paths come from `AppRoute`, the single source
 * for internal routes — a page keeps its existing path until it's
 * individually rebuilt, at which point the constant is renamed there and
 * every link follows. Consultation is deliberately absent from both lists
 * — it's the persistent CTA button, never a nav peer.
 */
export const PRIMARY_NAV_ITEMS = [
  { key: "home", href: AppRoute.Home },
  { key: "doctor", href: AppRoute.Doctor },
  { key: "packages", href: AppRoute.Packages },
  { key: "recipes", href: AppRoute.Recipes },
] as const;

export const MORE_NAV_ITEMS = [
  { key: "reviews", href: AppRoute.Reviews },
  { key: "videos", href: AppRoute.Videos },
  { key: "faq", href: AppRoute.Faq },
  { key: "calculator", href: AppRoute.Calculator },
] as const;

export type NavItemKey = (typeof PRIMARY_NAV_ITEMS)[number]["key"] | (typeof MORE_NAV_ITEMS)[number]["key"];
