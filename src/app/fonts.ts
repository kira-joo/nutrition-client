import { Cairo } from "next/font/google";

// Single bilingual family for both locales — see docs/design-system.md
// ("Typography") for why one typeface covers both Arabic and Latin here
// instead of pairing two separate fonts.
//
// Defined once and shared by every root layout (`[locale]/layout.tsx` and the
// standalone `lectures/layout.tsx`), so the two can never load diverging
// subsets or weights of the same face.
export const cairo = Cairo({
  subsets: ["arabic", "latin"],
  // 900 added for the homepage redesign's display moments (hero, section
  // headings) — the existing family stays the single bilingual typeface
  // (see docs/design-system.md "Typography" for why this app deliberately
  // doesn't pair a second display face); this only extends its own range.
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-cairo",
  display: "swap",
});
