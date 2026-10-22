export type Freshness = "fresh" | "aging" | "stale";

/** Whole days from an ISO date (YYYY-MM-DD) to today, in UTC so the result doesn't depend on the viewer's time zone. */
export function daysOld(asOf: string, today: Date): number {
  const [y, m, d] = asOf.split("-").map(Number);
  const then = Date.UTC(y, m - 1, d);
  const now = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  return Math.floor((now - then) / 86_400_000);
}

/** Under 45 days: fresh. 45 to 90: aging. Over 90: stale (the plan's thresholds). */
export function freshness(asOf: string, today: Date): { level: Freshness; days: number; label: string } {
  const days = daysOld(asOf, today);
  if (days < 45) return { level: "fresh", days, label: `Fresh · ${days} days old` };
  if (days <= 90) return { level: "aging", days, label: `Aging · ${days} days old` };
  return { level: "stale", days, label: `Stale · ${days} days old` };
}
