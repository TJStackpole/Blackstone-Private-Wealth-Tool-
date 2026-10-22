/**
 * What a rush of withdrawals does to a target date fund with a private slice, before any rebalancing. The fund pays
 * savers from its public part, which can be sold daily; the private part can't be sold that fast, so its share drifts up.
 * Amounts are % of the fund before the withdrawals.
 */
export function driftAfterWithdrawals(privatePct: number, withdrawPct: number) {
  const clamp = (v: number) => Math.min(100, Math.max(0, Number.isFinite(v) ? v : 0));
  const pri = clamp(privatePct);
  const w = clamp(withdrawPct);
  const pub = 100 - pri;
  const fromPublic = Math.min(w, pub);
  const left = 100 - fromPublic;
  return {
    /** True when the public part alone covers every withdrawal. */
    paidInFull: fromPublic >= w,
    /** Share of withdrawals that could be paid right away. */
    paidPct: w > 0 ? (fromPublic / w) * 100 : 100,
    publicAfter: pub - fromPublic,
    privateAfter: pri,
    /** The private slice as a share of what's left. */
    privateShareAfter: left > 0 ? (pri / left) * 100 : 0,
  };
}
