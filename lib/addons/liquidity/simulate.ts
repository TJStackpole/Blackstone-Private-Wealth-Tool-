import { proRataFill } from "./prorata";

export interface SimParams {
  /** Dollar value the investor asks to redeem. */
  amount: number;
  /** How many quarters to show. */
  quarters: number;
  /** Fund's quarterly limit, % of the fund. */
  limitPct: number;
  /** Everyone's requests in each quarter, % of the fund. The last value repeats if the list is shorter than `quarters`. */
  requestsPct: number[];
  /** Ask again for the unfilled part each quarter? */
  resubmit: boolean;
  /** Change in the fund's value per quarter, % (applies to the part still invested). */
  navChangePct: number;
  /** Deduction on each payout, % (e.g. 2 for shares held under a year). */
  earlyDeductionPct: number;
}

export interface SimRow {
  quarter: number;
  /** Value asked for this quarter. */
  requested: number;
  /** Share of each request filled, 0–1. */
  fillRate: number;
  /** Value sold back before any deduction. */
  gross: number;
  deduction: number;
  /** Cash actually received this quarter. */
  cash: number;
  cumulativeCash: number;
  /** Value of the shares not yet sold, after this quarter. */
  remaining: number;
}

/** Quarter-by-quarter schedule of what a redemption request turns into. Pure: same inputs, same output. */
export function simulateRedemption(p: SimParams): SimRow[] {
  const rows: SimRow[] = [];
  let remaining = Math.max(0, p.amount);
  let cumulativeCash = 0;
  const n = Math.max(1, Math.floor(p.quarters));
  for (let q = 1; q <= n; q++) {
    if (q > 1) remaining = Math.max(0, remaining * (1 + p.navChangePct / 100));
    const requestsPct = p.requestsPct.length ? p.requestsPct[Math.min(q - 1, p.requestsPct.length - 1)] : 0;
    const requested = q === 1 || p.resubmit ? remaining : 0;
    const fillRate = requested > 0 ? proRataFill(p.limitPct, requestsPct) : 0;
    const gross = requested * fillRate;
    const deduction = gross * (Math.max(0, p.earlyDeductionPct) / 100);
    const cash = gross - deduction;
    remaining -= gross;
    cumulativeCash += cash;
    rows.push({ quarter: q, requested, fillRate, gross, deduction, cash, cumulativeCash, remaining });
  }
  return rows;
}

/** Cash received by the end of a given number of months (whole quarters). */
export function cashWithin(rows: SimRow[], months: number): number {
  const q = Math.floor(months / 3);
  if (q < 1) return 0;
  return rows[Math.min(q, rows.length) - 1]?.cumulativeCash ?? 0;
}

function roundMoney(n: number): string {
  const step = n >= 100_000 ? 1_000 : 100;
  return `$${(Math.round(n / step) * step).toLocaleString("en-US")}`;
}

/** The headline sentence, generated from the same rows the table shows. */
export function headline(rows: SimRow[], months = 6): string {
  const q = Math.min(Math.floor(months / 3), rows.length);
  const cash = cashWithin(rows, q * 3);
  return `In this scenario, you'd receive about ${roundMoney(cash)} within ${q * 3} months.`;
}

export interface Preset {
  id: "normal" | "stressed" | "backlog";
  label: string;
  /** Requests as a multiple of the fund's limit, per quarter. */
  requestsVsLimit: number[];
  note: string;
}

/** Illustrative scenarios. Each note says what real event it resembles. */
export const PRESETS: Preset[] = [
  {
    id: "normal",
    label: "Normal times",
    requestsVsLimit: [0.6],
    note: "Requests below the limit, so every request is filled. BREIT filled all requests from February to December 2024.",
  },
  {
    id: "stressed",
    label: "Stressed",
    requestsVsLimit: [2, 1],
    note: "One quarter with requests at twice the limit, so about half of each request is filled. BCRED's requests were about twice its 5% level in the second quarter of 2026.",
  },
  {
    id: "backlog",
    label: "Prolonged backlog",
    requestsVsLimit: [2, 2, 2, 2, 1],
    note: "Four quarters in a row at twice the limit. BCRED prorated in the second and third quarters of 2026; BREIT limited repurchases at times between late 2022 and early 2024.",
  },
];
