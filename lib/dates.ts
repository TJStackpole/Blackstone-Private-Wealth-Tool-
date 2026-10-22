/**
 * One place for every date the site shows ("as of", "checked", "last updated"), in New York time.
 * A plain date (2026-06-30) is a calendar date, such as a quarter-end, and is shown exactly as written. A timestamp
 * (2026-10-22T01:03:29Z) is shown as the date it was in New York, so a late-evening update isn't labeled the next day.
 */
export const NEW_YORK = "America/New_York";

const PLAIN_DATE = /^\d{4}-\d{2}-\d{2}$/;

type Month = "short" | "long";

function toDate(value: string): { date: Date; timeZone: string } | null {
  if (PLAIN_DATE.test(value)) {
    const [y, m, d] = value.split("-").map(Number);
    // Noon UTC, read back in UTC: the calendar day can't shift whatever the viewer's time zone.
    const date = new Date(Date.UTC(y, m - 1, d, 12));
    return date.getUTCMonth() === m - 1 ? { date, timeZone: "UTC" } : null;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : { date, timeZone: NEW_YORK };
}

/** "Jun 30, 2026" (or "June 30, 2026" with month: "long"). Anything that isn't a date is returned unchanged. */
export function formatDate(value: string, month: Month = "short"): string {
  const d = toDate(value);
  if (!d) return value;
  return d.date.toLocaleDateString("en-US", { year: "numeric", month, day: "numeric", timeZone: d.timeZone });
}

/** "Jun 2026" / "June 2026". */
export function formatMonth(value: string, month: Month = "short"): string {
  const d = toDate(value);
  if (!d) return value;
  return d.date.toLocaleDateString("en-US", { year: "numeric", month, timeZone: d.timeZone });
}

/** Today's date in New York, as YYYY-MM-DD: what scripts write for "checked" and "updated". */
export function todayInNewYork(now: Date = new Date()): string {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", { timeZone: NEW_YORK, year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}
