/**
 * The primary IA: Home / Doctor / Packages / Recipes visible on both
 * desktop and mobile, everything else tucked under "More" on desktop
 * (flattened into one list in the mobile drawer, where there's no room
 * for a nested disclosure). `href` values point at this app's CURRENT
 * route paths, not the master plan's final renamed ones (e.g. `/doctor`)
 * — each page keeps its existing path until it's individually rebuilt
 * later in this phase, at which point its route folder gets renamed and
 * this one file is updated. Consultation is deliberately absent from both
 * lists — it's the persistent CTA button, never a nav peer.
 */
export const PRIMARY_NAV_ITEMS = [
  { key: "home", href: "/" },
  { key: "doctor", href: "/about_us" },
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
