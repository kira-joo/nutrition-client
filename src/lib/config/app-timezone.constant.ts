/**
 * The clinic's one configured timezone. Mirrors `nutrition-staff`'s own
 * `src/common/config/app-timezone.constant.ts` (same clinic, same real-world
 * timezone) — kept as a separate copy rather than a shared package on
 * purpose, the same way `CacheTag` and other project-specific constants are
 * duplicated rather than shared: the two apps are separate processes with no
 * shared runtime, and a toolkit package must not carry this project's
 * domain knowledge.
 *
 * Set once via `DateTimeConfig.timeZone` (see `configure-timezone.ts`) so no
 * campaign date/countdown call site needs to pass a timezone manually.
 */
export const APP_TIMEZONE = "Africa/Cairo";
