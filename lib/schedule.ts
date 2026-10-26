import { formatDate, formatMonth } from "./dates";

/**
 * The SEC filing schedule these funds report on: a 10-Q about 45 days after the March, June and September
 * quarter-ends, and a 10-K about 90 days after December 31. The same lags the Reality Check's freshness badge uses.
 */
export const LAG_DAYS = { "10-Q": 45, "10-K": 90 } as const;

/** Month-end NAVs: each fund files its month-end NAV in an 8-K (BREIT: a prospectus supplement) about three weeks after. */
export const MONTHLY_LAG_DAYS = 21;

export type Cadence = "quarterly" | "annual" | "monthly";

export interface NextUpdate {
  form: "10-Q" | "10-K" | "8-K";
  /** The period the next report covers (YYYY-MM-DD). */
  period: string;
  /** About when it's due (YYYY-MM-DD). */
  due: string;
  /** "November 2026". */
  month: string;
  /** One sentence on where the month comes from. */
  basis: string;
}

const DAY = 86_400_000;
const QUARTER_ENDS = [
  [2, 31],
  [5, 30],
  [8, 30],
  [11, 31],
] as const;

/**
 * When data as of `asOf` should next be refreshed: the next quarterly report (or, for figures only an annual report
 * gives, the next 10-K), using the schedule above. A date, not a figure: nothing here estimates fund numbers.
 */
export function nextUpdate(asOf: string, cadence: Cadence = "quarterly"): NextUpdate | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(asOf)) return null;
  const [y, m, d] = asOf.split("-").map(Number);
  if (cadence === "monthly") {
    // The next month-end after asOf (day 0 of the month after next is the last day of next month).
    const end = Date.UTC(y, d >= new Date(Date.UTC(y, m, 0)).getUTCDate() ? m + 1 : m, 0);
    const due = new Date(end + MONTHLY_LAG_DAYS * DAY).toISOString().slice(0, 10);
    const period = new Date(end).toISOString().slice(0, 10);
    return {
      form: "8-K",
      period,
      due,
      month: formatMonth(due, "long"),
      basis: `The fund files its NAV for ${formatDate(period, "long")} about three weeks after that month ends.`,
    };
  }
  const after = Date.UTC(y, m - 1, d);
  const ends = cadence === "annual" ? QUARTER_ENDS.slice(3) : QUARTER_ENDS;
  let end = 0;
  for (let yy = y; !end && yy <= y + 1; yy++) for (const [mm, dd] of ends) if (!end && Date.UTC(yy, mm, dd) > after) end = Date.UTC(yy, mm, dd);
  const form = new Date(end).getUTCMonth() === 11 ? "10-K" : "10-Q";
  const period = new Date(end).toISOString().slice(0, 10);
  const due = new Date(end + LAG_DAYS[form] * DAY).toISOString().slice(0, 10);
  return {
    form,
    period,
    due,
    month: formatMonth(due, "long"),
    basis: `The Form ${form} for the ${form === "10-K" ? "year" : "quarter"} ending ${formatDate(period, "long")} is due about ${LAG_DAYS[form]} days after it ends.`,
  };
}

/** The schedule a source follows, read from its name: a 10-Q is quarterly, a 10-K annual. Other sources have no SEC schedule. */
export function cadenceOf(sourceName: string): Cadence | null {
  if (/\b10-Q\b/.test(sourceName)) return "quarterly";
  if (/\b10-K\b/.test(sourceName)) return "annual";
  return null;
}
