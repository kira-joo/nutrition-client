"use client";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/cn";
import { Locale } from "@/constant/Locale.enum";
import { usePathname, useRouter } from "@/i18n/navigation";

/**
 * A text toggle ("EN | AR"), not a flag icon and not a single button
 * showing only the other locale — see the approved plan's navigation
 * requirements. Preserves the current query string across the switch
 * (e.g. `?package=basic`), matching the one piece of real behavior worth
 * carrying forward from the pre-rebuild `LanguageSwitch` component.
 */
export function LanguageToggle() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const t = useTranslations("layout");

  function switchTo(target: Locale) {
    if (target === locale) return;
    const query = searchParams.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { locale: target });
  }

  return (
    <div className="flex items-center gap-1.5 text-body-sm font-semibold" aria-label={t("language.switchTo")}>
      <button
        type="button"
        onClick={() => switchTo(Locale.EN)}
        aria-current={locale === Locale.EN}
        className={cn("transition-colors duration-fast", locale === Locale.EN ? "text-primary" : "text-text-muted hover:text-text-primary")}
      >
        EN
      </button>
      <span aria-hidden="true" className="text-text-muted">
        |
      </span>
      <button
        type="button"
        onClick={() => switchTo(Locale.AR)}
        aria-current={locale === Locale.AR}
        className={cn("transition-colors duration-fast", locale === Locale.AR ? "text-primary" : "text-text-muted hover:text-text-primary")}
      >
        AR
      </button>
    </div>
  );
}
