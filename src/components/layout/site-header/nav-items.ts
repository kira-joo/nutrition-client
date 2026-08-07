/**
 * The primary IA: Home / Doctor / Packages / Recipes visible on both
 * desktop and mobile, everything else tucked under "More" on desktop
 * (flattened into one list in the mobile drawer, where there's no room
 * for a nested disclosure). `href` values point at this app's CURRENT
 * route paths: a page keeps its existing path until it's individually
 * rebuilt, at which point its route folder is renamed to the plan's final
 * name and this one file is updated (as `/about_us` → `/doctor` already
 * was). Consultation is deliberately absent from both lists — it's the
 * persistent CTA button, never a nav peer.
 */
export const PRIMARY_NAV_ITEMS = [
  { key: "home", href: "/" },
  { key: "doctor", href: "/doctor" },
  { key: "packages", href: "/packages" },
  { key: "recipes", href: "/recipes" },
] as const;

export const MORE_NAV_ITEMS = [
  { key: "reviews", href: "/reviews" },
  { key: "videos", href: "/videos" },
  { key: "faq", href: "/faq" },
  { key: "calculator", href: "/calculator" },
] as const;

export type NavItemKey = (typeof PRIMARY_NAV_ITEMS)[number]["key"] | (typeof MORE_NAV_ITEMS)[number]["key"];
