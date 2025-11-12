"use client";
import { Locale } from "@/constant/Locale.enum";
import { Box, Button } from "@mui/material";
import { usePathname, useRouter } from "next/navigation";

const LanguageSwitch = () => {
  const pathname = usePathname();
  const router = useRouter();

  const currentLocale = pathname.split("/")[1] || Locale.AR;
  const otherLocale = currentLocale === Locale.AR ? Locale.EN : Locale.AR;

  const switchLocale = () => {
    const segments = pathname.split("/");
    if (!segments[1]) {
      segments.splice(1, 0, otherLocale);
    } else {
      segments[1] = otherLocale;
    }
    router.push(segments.join("/"));
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
