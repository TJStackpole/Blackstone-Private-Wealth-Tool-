/** Formatting helpers shared by the panel, maps and footer. */

/** Whole numbers print without a decimal ("42%"); others keep one ("8.4%"). */
export function formatPct(n: number): string {
  return Number.isInteger(n) ? `${n}%` : `${n.toFixed(1)}%`;
}

export function formatMoneyMillions(m: number): string {
  return m >= 1000 ? `$${(m / 1000).toFixed(2)}B` : `$${Math.round(m).toLocaleString("en-US")}M`;
}
