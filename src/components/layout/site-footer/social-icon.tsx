import { Facebook, Instagram, Linkedin, Mail, MessageCircle, Share2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/** Maps nutrition-staff's free-text `socialLinks[].platform` field to an icon — falls back to a generic share glyph for a platform this list doesn't recognize yet, rather than rendering nothing. */
const PLATFORM_ICON: Record<string, LucideIcon> = {
  facebook: Facebook,
  instagram: Instagram,
  linkedin: Linkedin,
  whatsapp: MessageCircle,
  email: Mail,
};

export function SocialIcon({ platform, className }: { platform: string; className?: string }) {
  const Icon = PLATFORM_ICON[platform.toLowerCase()] ?? Share2;
  return <Icon className={className} aria-hidden="true" />;
}
