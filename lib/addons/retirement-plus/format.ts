/** $3.3M, $499k, $1.2B, $0, −$12k. Rounds first, so $999,600 reads $1.0M, not $1000k. `digits` sets the decimals for millions. */
export function short(n: number, digits = 1): string {
  if (!Number.isFinite(n)) return "—";
  const a = Math.abs(n);
  const s = n < 0 ? "−" : "";
  if (a < 500) return "$0";
  const k = Math.round(a / 1000);
  if (k < 1000) return `${s}$${k}k`;
  const m = Math.round(a / 10 ** (6 - digits)) / 10 ** digits;
  if (m < 1000) return `${s}$${m.toFixed(digits)}M`;
  return `${s}$${(Math.round(a / 1e8) / 10).toFixed(1)}B`;
}

/**
 * Two balances shown side by side with their difference: when both are in millions and they're less than $1M apart,
 * two decimals ($1.12M vs. $1.19M), so the pair never reads "$1.1M vs. $1.1M" next to a +$69k difference.
 */
export function shortPair(a: number, b: number): [string, string] {
  const digits = Math.min(Math.abs(a), Math.abs(b)) >= 999_500 && Math.abs(a - b) < 1e6 ? 2 : 1;
  return [short(a, digits), short(b, digits)];
}

/** +$499k, −$12k, $0. */
export const signed = (n: number) => (Math.abs(n) < 500 ? "$0" : n > 0 ? `+${short(n)}` : short(n));

/** $112,447, −$1,200. */
export const money = (n: number) => `${n < 0 ? "−" : ""}$${Math.abs(Math.round(n)).toLocaleString("en-US")}`;
