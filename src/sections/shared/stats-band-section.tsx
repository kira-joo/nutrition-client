import { getTranslations } from "next-intl/server";
import type { Locale } from "@/constant/Locale.enum";
import { decimalsFor, statNumberFormat } from "@/lib/animation/stat-number-format";
import type { LocalizedDoctorProfile } from "@/lib/domain/doctor-profile";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { StatFigure } from "@/components/stats/stat-figure";

export interface StatsBandSectionProps {
  doctorProfile: LocalizedDoctorProfile | null;
  /** For number formatting only — see `StatFigure` for why this is not the content-locale rule. */
  locale: Locale;
}

/**
 * The headline-figures band.
 *
 * **Every value is CMS-owned** (`doctorProfile.stats`) and nothing here invents
 * one: with no enabled stats the section renders nothing at all rather than
 * showing placeholder figures, because a fabricated statistic on a clinic's site
 * is a factual claim nobody authorised.
 *
 * Filtering and ordering happen here rather than server-side because the public
 * doctor-profile endpoint returns the whole singleton — an editor can disable a
 * figure without losing it, and this decides what to show.
 *
 * **No visible heading, by design.** The figures are the statement; a heading
 * above them would restate what the labels already say. The section still needs
 * a name for anyone navigating by landmark, so it takes one from the UI locale
 * files — that names the *section*, which is not content an editor would want to
 * edit, so it is deliberately not part of the CMS contract.
 *
 * One `Reveal` around the whole band, not one per figure: the motion system asks
 * for one reveal per logical block, and four figures arriving separately would
 * read as four events instead of one.
 */
export async function StatsBandSection({ doctorProfile, locale }: StatsBandSectionProps) {
  const t = await getTranslations("layout");

  const stats = (doctorProfile?.stats ?? []).filter((stat) => stat.enabled).sort((a, b) => a.order - b.order);

  if (stats.length === 0) return null;

  return (
    <Section className="bg-primary-soft">
      <Container>
        <Reveal>
          <ul aria-label={t("stats.label")} className="grid grid-cols-2 gap-x-6 gap-y-10 text-center lg:grid-cols-4">
            {stats.map((stat) => (
              <li key={`${stat.order}-${stat.label}`} className="flex flex-col items-center gap-1">
                <p className="text-heading-1 font-bold text-primary">
                  <StatFigure
                    value={stat.value}
                    suffix={stat.suffix}
                    locale={locale}
                    /* Formatted server-side so the real figure is in the HTML
                       before any script runs, through the same helper the count
                       uses so the two cannot disagree. */
                    formatted={statNumberFormat(locale, decimalsFor(stat.value)).format(stat.value)}
                  />
                </p>
                <p className="max-w-[16ch] text-balance text-body-sm text-text-secondary">{stat.label}</p>
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>
    </Section>
  );
}
