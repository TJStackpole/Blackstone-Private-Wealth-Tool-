/** The federal net investment income tax rate (IRS Topic 559). */
export const NIIT = 0.038;

/**
 * The combined rates a projection uses, in percent: on the taxable part of a payout (federal bracket, after the 199A
 * deduction if it applies, plus the NIIT and state tax) and on capital gains.
 */
export function combinedRates(p: Pick<TaxParams, "ordinaryRatePct" | "capitalGainsRatePct" | "stateRatePct" | "niit" | "qrdDeduction">) {
  const fedIncome = p.ordinaryRatePct * (p.qrdDeduction ? 0.8 : 1);
  const ni = p.niit ? NIIT * 100 : 0;
  return { fedIncome, niit: ni, state: p.stateRatePct, income: fedIncome + ni + p.stateRatePct, gains: p.capitalGainsRatePct + ni + p.stateRatePct };
}

/** Inputs to the return-of-capital projection. Rates are in percent. */
export interface TaxParams {
  invested: number;
  /** Payout per year as a share of the investment's value. */
  distributionRatePct: number;
  /** Share of each payout that is return of capital (ROC). */
  rocPct: number;
  /** Share classified as a capital gain distribution, taxed at the capital gains rate. The rest is an ordinary REIT dividend. Default 0. */
  capitalGainsSharePct?: number;
  /** Federal income tax bracket. */
  ordinaryRatePct: number;
  /** Federal long-term capital gains rate. */
  capitalGainsRatePct: number;
  /** State income tax rate; states tax dividends and capital gains alike. */
  stateRatePct: number;
  /** Add the 3.8% federal net investment income tax on dividends and gains (above $250,000 of joint income; IRS Topic 559). */
  niit?: boolean;
  years: number;
  /** Section 199A: deduct 20% of qualified REIT dividends, so only 80% of the taxable part is taxed. */
  qrdDeduction: boolean;
  /** Change in the share price each year (0 = sold at the price paid). */
  priceChangePct?: number;
}

export interface TaxYear {
  year: number;
  cash: number;
  /** Part of the payout that lowered basis. */
  roc: number;
  /** Part taxed now as an ordinary REIT dividend. */
  taxable: number;
  /** Part taxed now as a capital gain distribution. */
  capitalGainDist: number;
  /** ROC beyond the remaining basis, taxed now as a capital gain. */
  excessGain: number;
  taxNow: number;
  afterTaxCash: number;
  basisStart: number;
  basisEnd: number;
}

export interface TaxProjection {
  rows: TaxYear[];
  saleValue: number;
  gainOnSale: number;
  taxOnSale: number;
  totalCash: number;
  totalTaxNow: number;
  /** Payouts plus sale proceeds, less every tax in the projection. */
  afterTaxTotal: number;
  /** For comparison: tax if every payout were taxed in the year received, plus tax on any price gain at sale. */
  taxIfAllTaxedNow: number;
  notes: string[];
}

const num = (v: number, lo = 0, hi = Infinity) => Math.min(hi, Math.max(lo, Number.isFinite(v) ? v : 0));

/**
 * Year-by-year tax on payouts that are partly return of capital, then the tax due at sale.
 * ROC isn't taxed when received; it lowers cost basis instead, which raises the taxable gain at sale.
 * Basis never goes below zero: ROC beyond it is a capital gain in that year (IRS Tax Topic 404).
 * Payouts are taken in cash, not reinvested.
 */
export function projectTax(p: TaxParams): TaxProjection {
  const invested = num(p.invested);
  const rate = num(p.distributionRatePct, 0, 100) / 100;
  const roc = num(p.rocPct, 0, 100) / 100;
  const cgShare = Math.min(1 - roc, num(p.capitalGainsSharePct ?? 0, 0, 100) / 100);
  const ord = (num(p.ordinaryRatePct, 0, 100) / 100) * (p.qrdDeduction ? 0.8 : 1);
  const cg = num(p.capitalGainsRatePct, 0, 100) / 100;
  const st = num(p.stateRatePct, 0, 100) / 100;
  // The net investment income tax isn't reduced by the 199A deduction, so it's added after it.
  const ni = p.niit ? NIIT : 0;
  const years = Math.floor(num(p.years, 0, 50));
  const g = num(p.priceChangePct ?? 0, -100, 100) / 100;

  const rows: TaxYear[] = [];
  let basis = invested;
  let value = invested;
  for (let year = 1; year <= years; year++) {
    const cash = value * rate;
    const rocPart = cash * roc;
    const capitalGainDist = cash * cgShare;
    const taxable = cash - rocPart - capitalGainDist;
    const applied = Math.min(rocPart, basis);
    const excessGain = rocPart - applied;
    const basisStart = basis;
    basis -= applied;
    const taxNow = taxable * (ord + ni + st) + (capitalGainDist + excessGain) * (cg + ni + st);
    rows.push({ year, cash, roc: rocPart, taxable, capitalGainDist, excessGain, taxNow, afterTaxCash: cash - taxNow, basisStart, basisEnd: basis });
    value *= 1 + g;
  }

  const saleValue = value;
  const gainOnSale = saleValue - basis;
  const taxOnSale = Math.max(0, gainOnSale) * (cg + ni + st);
  const totalCash = rows.reduce((s, r) => s + r.cash, 0);
  const totalTaxNow = rows.reduce((s, r) => s + r.taxNow, 0);
  const taxIfAllTaxedNow = totalCash * (ord + ni + st) + Math.max(0, saleValue - invested) * (cg + ni + st);

  const notes: string[] = [];
  if (rows.some((r) => r.excessGain > 0)) notes.push("Basis reached zero, so later return of capital is taxed as a capital gain in the year it's paid.");
  if (gainOnSale < 0) notes.push("The sale is at a loss, so no tax is due on it here; a loss may offset other gains.");

  return {
    rows,
    saleValue,
    gainOnSale,
    taxOnSale,
    totalCash,
    totalTaxNow,
    afterTaxTotal: totalCash - totalTaxNow + saleValue - taxOnSale,
    taxIfAllTaxedNow,
    notes,
  };
}
