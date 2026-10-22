/** $3.3M, $499k, $1.2B, $0, −$12k. Rounds first, so $999,600 reads $1.0M, not $1000k. */
export function short(n: number): string {
  if (!Number.isFinite(n)) return "—";
  const a = Math.abs(n);
  const s = n < 0 ? "−" : "";
  if (a < 500) return "$0";
  const k = Math.round(a / 1000);
  if (k < 1000) return `${s}$${k}k`;
  const m = Math.round(a / 1e5) / 10;
  if (m < 1000) return `${s}$${m.toFixed(1)}M`;
  return `${s}$${(Math.round(a / 1e8) / 10).toFixed(1)}B`;
}

/** +$499k, −$12k, $0. */
export const signed = (n: number) => (Math.abs(n) < 500 ? "$0" : n > 0 ? `+${short(n)}` : short(n));

/** $112,447, −$1,200. */
export const money = (n: number) => `${n < 0 ? "−" : ""}$${Math.abs(Math.round(n)).toLocaleString("en-US")}`;
