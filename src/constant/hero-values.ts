import { Award, Users, type LucideIcon } from "lucide-react";

export interface HeroValueItem {
  key: "experience" | "clients";
  icon: LucideIcon;
}

/**
 * Static marketing values for the homepage hero — not backed by any CMS
 * field. DoctorProfile has no numeric stats (years of experience, client
 * count, etc.), and the plan explicitly rules out deriving these from API
 * `total` counts (recipes/reviews/videos aren't a meaningful stand-in for
 * "years of experience" or "clients served"). Approved as placeholders
 * pending real data; the copy itself lives in `home.hero.values.*`
 * (ar/en), so swapping in real values — or a real CMS field, later — is a
 * one- or two-file change, not a component rewrite.
 */
export const HERO_VALUE_ITEMS: HeroValueItem[] = [
  { key: "experience", icon: Award },
  { key: "clients", icon: Users },
];
