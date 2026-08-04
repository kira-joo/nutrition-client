"use client";
import { Locale } from "@/constant/Locale.enum";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Box, Button } from "@mui/material";
import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";

const LanguageSwitch = () => {
  // usePathname()/useRouter() here are next-intl's locale-aware wrappers —
  // pathname comes back WITHOUT the locale prefix, and router.push's
  // `{ locale }` option adds the right one back on. useSearchParams() is
  // still the plain Next.js hook (next-intl doesn't wrap it) — carried
  // over explicitly so switching locale doesn't drop the current query
  // string, which the old manual pathname-splicing version did.
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentLocale = useLocale();

  const otherLocale = currentLocale === Locale.AR ? Locale.EN : Locale.AR;
  const query = searchParams.toString();

  const switchLocale = () => {
    router.push(query ? `${pathname}?${query}` : pathname, { locale: otherLocale });
  };

  return (
    <Box sx={{ px: 2 }}>
      <Button
        variant="outlined"
        size="small"
        onClick={switchLocale}
        sx={{ minWidth: "auto", px: 2 }}
      >
        {otherLocale.toUpperCase()}
      </Button>
    </Box>
  );
};

export default LanguageSwitch;
