export type Freshness = "fresh" | "aging" | "stale";

/** Whole days from an ISO date (YYYY-MM-DD) to today, in UTC so the result doesn't depend on the viewer's time zone. */
export function daysOld(asOf: string, today: Date): number {
  const [y, m, d] = asOf.split("-").map(Number);
  const then = Date.UTC(y, m - 1, d);
  const now = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  return Math.floor((now - then) / 86_400_000);
}

const DAY = 86_400_000;

/**
 * The most recent quarter-end whose filing should be out by `today`: a 10-Q about 45 days after March, June and
 * September quarter-ends, a 10-K about 90 days after December.
 */
export function latestExpectedQuarterEnd(today: Date): string {
  const now = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  for (let y = today.getUTCFullYear(); y >= today.getUTCFullYear() - 2; y--) {
    for (const [m, d, lag] of [[11, 31, 90], [8, 30, 45], [5, 30, 45], [2, 31, 45]] as const) {
      const end = Date.UTC(y, m, d);
      if (end + lag * DAY <= now) return new Date(end).toISOString().slice(0, 10);
    }
  }
  return "1970-01-01";
}

/**
 * Whether a snapshot is the latest one available. Quarterly data is always weeks old, so age alone would call the
 * newest filing stale; instead this counts how many quarterly filings have come due since the snapshot's date.
 */
export function freshness(asOf: string, today: Date): { level: Freshness; days: number; label: string } {
  const days = daysOld(asOf, today);
  const expected = latestExpectedQuarterEnd(today);
  if (asOf >= expected) return { level: "fresh", days, label: "Latest filing" };
  const [ey, em] = expected.split("-").map(Number);
  const [ay, am] = asOf.split("-").map(Number);
  const behind = Math.ceil(((ey - ay) * 12 + (em - am)) / 3);
  if (behind <= 1) return { level: "aging", days, label: "Newer filing due" };
  return { level: "stale", days, label: "Out of date" };
}
