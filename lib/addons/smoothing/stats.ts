/** Return-series statistics for the smoothing chart. Returns are decimals per period (0.02 = 2%). */

/** Annualized volatility: the sample standard deviation of returns, scaled by √(periods per year). */
export function volatility(returns: number[], periodsPerYear = 4): number {
  const n = returns.length;
  if (n < 2) return 0;
  const mean = returns.reduce((s, r) => s + r, 0) / n;
  const variance = returns.reduce((s, r) => s + (r - mean) ** 2, 0) / (n - 1);
  return Math.sqrt(variance) * Math.sqrt(periodsPerYear);
}

/** Growth of `start` through the returns, including the starting point (length n + 1). */
export function levels(returns: number[], start = 100): number[] {
  const out = [start];
  for (const r of returns) out.push(out[out.length - 1] * (1 + r));
  return out;
}

/** Worst peak-to-trough fall, as a positive fraction, with where it began and bottomed (indices into levels()). */
export function maxDrawdown(returns: number[]): { drawdown: number; peak: number; trough: number } {
  const lv = levels(returns, 1);
  let peakAt = 0;
  let best = { drawdown: 0, peak: 0, trough: 0 };
  lv.forEach((v, i) => {
    if (v > lv[peakAt]) peakAt = i;
    const dd = 1 - v / lv[peakAt];
    if (dd > best.drawdown) best = { drawdown: dd, peak: peakAt, trough: i };
  });
  return best;
}

/**
 * Geltner-style desmoothing: treat each appraised return as (1 − α) × true return + α × last period's appraised return,
 * and solve for the true return. α = 0 returns the series unchanged. α is capped below 1.
 */
export function desmooth(returns: number[], alpha: number): number[] {
  const a = Math.min(0.95, Math.max(0, Number.isFinite(alpha) ? alpha : 0));
  if (a === 0) return [...returns];
  return returns.map((r, t) => (t === 0 ? r : (r - a * returns[t - 1]) / (1 - a)));
}

/** The forward version: what appraisal smoothing at α does to a series (used to build and check sample data). */
export function smooth(returns: number[], alpha: number): number[] {
  const a = Math.min(0.95, Math.max(0, alpha));
  const out: number[] = [];
  returns.forEach((r, t) => out.push(t === 0 ? r : (1 - a) * r + a * out[t - 1]));
  return out;
}
