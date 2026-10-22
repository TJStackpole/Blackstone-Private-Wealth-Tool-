/** $3.3M, $499k, $0, −$12k. */
export function short(n: number): string {
  const a = Math.abs(n);
  const s = n < 0 ? "−" : "";
  if (a >= 1e6) return `${s}$${(a / 1e6).toFixed(1)}M`;
  if (a >= 500) return `${s}$${Math.round(a / 1000)}k`;
  return "$0";
}

/** +$499k, −$12k, $0. */
export const signed = (n: number) => (Math.abs(n) < 500 ? "$0" : n > 0 ? `+${short(n)}` : short(n));

/** $112,447, −$1,200. */
export const money = (n: number) => `${n < 0 ? "−" : ""}$${Math.abs(Math.round(n)).toLocaleString("en-US")}`;
