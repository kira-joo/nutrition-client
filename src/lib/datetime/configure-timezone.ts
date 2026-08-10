import { DateTimeConfig } from "@kira-joo/toolkit-common";
import { APP_TIMEZONE } from "@/lib/config/app-timezone.constant";

/**
 * Side-effect-only module: importing it configures the app-wide zoned-date
 * default once. Mirrors nutrition-staff's own dual entry-point pattern
 * (`instrumentation.ts` for its server, `providers.tsx` for its client) —
 * imported once from `src/app/[locale]/layout.tsx` (server) and once from
 * `src/app/providers.tsx` (client), since server and client are separate
 * module graphs/processes and neither can configure the other.
 *
 * Every campaign date/countdown call site can then call toolkit-common's
 * zoned-date functions (`resolveEndOfDayInZone`, `getZonedParts`, ...)
 * without passing a `timeZone` argument, and without ever falling back to
 * the browser's local timezone.
 */
DateTimeConfig.timeZone = APP_TIMEZONE;
