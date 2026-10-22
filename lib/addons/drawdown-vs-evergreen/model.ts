import bxpe from "@/data/addons/index-vs-fund/BXPE.json";

/** Inputs to the cash-drag comparison. Rates are percent a year. Both structures earn the same asset return. */
export interface CompareParams {
  commitment: number;
  /** Share of the commitment called at the start of each year (default 25% a year for four years). Extra beyond 100% is ignored. */
  callSchedulePct: number[];
  /** First year the drawdown fund returns money, and how much of its invested value it returns each year from then. */
  distributionStartYear: number;
  distributionPct: number;
  /** What uncalled and returned money earns while it waits. */
  cashYieldPct: number;
  /** The same for both structures, so the structure is the only difference. */
  assetReturnPct: number;
  drawdownFeePct: number;
  /** Drawdown funds commonly charge their fee on the full commitment during the call period. */
  drawdownFeeOnCommitment: boolean;
  evergreenFeePct: number;
  years: number;
}

export interface CompareYear {
  year: number;
  /** Share of the money that is invested in the fund (vs. waiting in cash), after that year's call. */
  drawdownAtWorkPct: number;
  evergreenAtWorkPct: number;
  drawdownValue: number;
  evergreenValue: number;
}

export interface CompareResult {
  rows: CompareYear[];
  drawdownEnd: number;
  evergreenEnd: number;
  averageDrawdownAtWorkPct: number;
}

const n = (v: number, lo = 0, hi = Infinity) => Math.min(hi, Math.max(lo, Number.isFinite(v) ? v : 0));

/**
 * Year by year: the drawdown investor starts with the whole commitment in cash, moves it into the fund as it's called,
 * and gets money back into cash once distributions start. The evergreen investor puts it all in on day one.
 * Fees are taken from the fund's value each year (the drawdown fee on the commitment during the call period, if chosen).
 * Performance fees, taxes and timing within the year are left out.
 */
export function compare(p: CompareParams): CompareResult {
  const C = n(p.commitment);
  const years = Math.floor(n(p.years, 0, 40));
  const r = n(p.assetReturnPct, -100, 100) / 100;
  const y = n(p.cashYieldPct, -100, 100) / 100;
  const dist = n(p.distributionPct, 0, 100) / 100;
  const ddFee = n(p.drawdownFeePct, 0, 100) / 100;
  const egFee = n(p.evergreenFeePct, 0, 100) / 100;
  const schedule = p.callSchedulePct.map((x) => n(x, 0, 100) / 100);
  const callYears = schedule.length;

  let cash = C;
  let fund = 0;
  let calledSoFar = 0;
  let eg = C;
  const rows: CompareYear[] = [];
  let atWorkSum = 0;

  for (let year = 1; year <= years; year++) {
    // Call at the start of the year (never more than what's left of the commitment, or the cash on hand).
    const want = Math.min(schedule[year - 1] ?? 0, Math.max(0, 1 - calledSoFar)) * C;
    const call = Math.min(want, cash);
    calledSoFar += want / (C || 1);
    cash -= call;
    fund += call;
    const atWork = fund + cash > 0 ? (fund / (fund + cash)) * 100 : 0;
    atWorkSum += atWork;

    // Growth and fees over the year.
    // Fees on year-end value for both structures, so identical inputs give identical results.
    const grown = fund * (1 + r);
    const feeBase = p.drawdownFeeOnCommitment && year <= callYears ? C : grown;
    fund = grown - Math.min(grown, feeBase * ddFee);
    cash *= 1 + y;
    eg = eg * (1 + r) - eg * (1 + r) * egFee;

    // Distributions at year end move money from the fund back to cash.
    if (year >= p.distributionStartYear && dist > 0) {
      const out = fund * dist;
      fund -= out;
      cash += out;
    }

    rows.push({ year, drawdownAtWorkPct: atWork, evergreenAtWorkPct: C > 0 ? 100 : 0, drawdownValue: fund + cash, evergreenValue: eg });
  }

  return {
    rows,
    drawdownEnd: rows.at(-1)?.drawdownValue ?? C,
    evergreenEnd: rows.at(-1)?.evergreenValue ?? C,
    averageDrawdownAtWorkPct: years ? atWorkSum / years : 0,
  };
}

export const DEFAULTS: CompareParams = {
  commitment: 10_000_000,
  callSchedulePct: [25, 25, 25, 25],
  distributionStartYear: 5,
  distributionPct: 15,
  cashYieldPct: 4,
  assetReturnPct: 9,
  drawdownFeePct: 1.75,
  drawdownFeeOnCommitment: true,
  evergreenFeePct: bxpe.fees.management.value,
  years: 10,
};
