/** Inputs to the index → fund bridge, all in percent a year. Every step's size comes from these; nothing is built in. */
export interface BridgeParams {
  /** The starting point: the index's return. */
  indexReturn: number;
  /** True when the index is already after fees, so the fund's own fee steps are shown as zero. */
  indexIsNet: boolean;
  /** Borrowing beyond the index's, as a share of the fund's assets (0–90). */
  extraLeveragePct: number;
  /** What that borrowing costs. */
  borrowCostPct: number;
  /** Share of the fund held in cash for redemptions. */
  cashPct: number;
  cashYieldPct: number;
  managementFeePct: number;
  /** Share of returns above the hurdle paid as a performance or incentive fee (simplified: no high-water mark or catch-up). */
  performanceFeePct: number;
  hurdlePct: number;
  /** The share class's servicing fee. */
  servicingFeePct: number;
}

export type StepKey = "leverage" | "cash" | "management" | "performance" | "servicing";

export interface BridgeStep {
  key: StepKey;
  label: string;
  /** Change in return this step causes (negative is a cost). */
  delta: number;
  from: number;
  to: number;
}

export interface Bridge {
  start: number;
  steps: BridgeStep[];
  end: number;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, Number.isFinite(v) ? v : 0));

/**
 * Walks from the index's return to an estimated fund return, one cause at a time:
 * borrowing, cash held back, management fee, performance fee, servicing fee.
 * Each step starts where the last ended, so the steps always add up from start to end.
 */
export function buildBridge(p: BridgeParams): Bridge {
  const start = Number.isFinite(p.indexReturn) ? p.indexReturn : 0;
  const L = clamp(p.extraLeveragePct, 0, 90) / 100;
  const c = clamp(p.cashPct, 0, 100) / 100;
  const steps: BridgeStep[] = [];
  let r = start;
  const add = (key: StepKey, label: string, delta: number) => {
    const d = delta === 0 ? 0 : delta; // no -0 in labels
    steps.push({ key, label, delta: d, from: r, to: r + d });
    r += d;
  };

  // Borrowing earns the asset return minus the cost of the debt on the extra assets it buys.
  add("leverage", "Borrowing", L === 0 ? 0 : ((r - p.borrowCostPct) * L) / (1 - L));
  // Cash earns its own yield instead of the fund's return.
  add("cash", "Cash for redemptions", -c * (r - p.cashYieldPct));
  add("management", "Management fee", p.indexIsNet ? 0 : -Math.max(0, p.managementFeePct));
  add("performance", "Performance fee", p.indexIsNet ? 0 : -(Math.max(0, p.performanceFeePct) / 100) * Math.max(0, r - p.hurdlePct));
  add("servicing", "Servicing fee", -Math.max(0, p.servicingFeePct));

  return { start, steps, end: r };
}
