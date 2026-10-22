import type { GlideRow } from "./data";

export interface Mix {
  privateEquity: number;
  privateRealAssets: number;
  privateCredit: number;
  total: number;
}

/**
 * The private slice's mix at an age, from the published rows. At a listed age it's that row exactly; between listed ages
 * it moves in a straight line (this tool's assumption, stated on the page); outside them it holds the nearest row.
 */
export function mixAt(age: number, rows: GlideRow[]): Mix {
  const sorted = [...rows].sort((a, b) => a.age - b.age);
  const pick = (r: GlideRow): Mix => ({ ...r, total: r.privateEquity + r.privateRealAssets + r.privateCredit });
  if (sorted.length === 0) return { privateEquity: 0, privateRealAssets: 0, privateCredit: 0, total: 0 };
  if (age <= sorted[0].age) return pick(sorted[0]);
  const last = sorted[sorted.length - 1];
  if (age >= last.age) return pick(last);
  const i = sorted.findIndex((r) => r.age > age);
  const a = sorted[i - 1];
  const b = sorted[i];
  const t = (age - a.age) / (b.age - a.age);
  const lerp = (x: number, y: number) => x + (y - x) * t;
  const m = { privateEquity: lerp(a.privateEquity, b.privateEquity), privateRealAssets: lerp(a.privateRealAssets, b.privateRealAssets), privateCredit: lerp(a.privateCredit, b.privateCredit) };
  return { ...m, total: m.privateEquity + m.privateRealAssets + m.privateCredit };
}

export interface LabParams {
  startAge: number;
  retireAge: number;
  startSalary: number;
  raisePct: number;
  /** Contribution rate at the start age and at the retirement age, straight line between. */
  contribStartPct: number;
  contribEndPct: number;
  /** Size of the private slice, 0–30%. Its mix follows the published rows. */
  privatePct: number;
  /** Assumed yearly return of the public portfolio. */
  publicReturnPct: number;
  /** Assumed extra return of each private sleeve over public, per year. */
  premiumPct: { privateEquity: number; privateRealAssets: number; privateCredit: number };
  /** Extra yearly cost on the private slice. */
  privateFeePct: number;
  withdrawalPct: number;
  rows: GlideRow[];
}

const n = (v: number, lo = -Infinity, hi = Infinity) => Math.min(hi, Math.max(lo, Number.isFinite(v) ? v : 0));

export function salaryAt(age: number, p: Pick<LabParams, "startAge" | "startSalary" | "raisePct">): number {
  return n(p.startSalary, 0) * (1 + n(p.raisePct, -100) / 100) ** (age - p.startAge);
}

/** Straight line from the start rate at the start age to the end rate at the retirement age. */
export function contributionRate(age: number, p: Pick<LabParams, "startAge" | "retireAge" | "contribStartPct" | "contribEndPct">): number {
  const span = p.retireAge - p.startAge;
  if (span <= 0) return p.contribStartPct;
  const t = Math.min(1, Math.max(0, (age - p.startAge) / span));
  return p.contribStartPct + (p.contribEndPct - p.contribStartPct) * t;
}

export interface LabYear {
  age: number;
  publicOnly: number;
  withPrivate: number;
}

export interface LabResult {
  years: LabYear[];
  endPublicOnly: number;
  endWithPrivate: number;
  difference: number;
  incomePublicOnly: number;
  incomeWithPrivate: number;
  /** Percent more yearly income with the private slice (0 when the public-only income is 0). */
  incomeIncreasePct: number;
}

/**
 * Two paths from the start age to retirement, same salary and contributions: one all public, one with a private slice
 * whose mix follows the published rows. Each year the balance grows, then that year's contribution is added.
 * Income in retirement is the ending balance times the withdrawal rate. Social Security is left out, as in the paper.
 */
export function projectRetirement(p: LabParams): LabResult {
  const rp = n(p.publicReturnPct, -100, 100) / 100;
  const s = n(p.privatePct, 0, 30) / 100;
  const fee = Math.max(0, n(p.privateFeePct)) / 100;
  let pub = 0;
  let pri = 0;
  const years: LabYear[] = [{ age: p.startAge, publicOnly: 0, withPrivate: 0 }];
  for (let age = p.startAge; age < p.retireAge; age++) {
    const c = salaryAt(age, p) * (contributionRate(age, p) / 100);
    const m = mixAt(age, p.rows);
    const premium =
      m.total > 0
        ? (m.privateEquity * n(p.premiumPct.privateEquity) + m.privateRealAssets * n(p.premiumPct.privateRealAssets) + m.privateCredit * n(p.premiumPct.privateCredit)) /
          m.total /
          100
        : 0;
    const rPrivate = rp + premium - fee;
    pub = pub * (1 + rp) + c;
    pri = pri * (1 + (1 - s) * rp + s * rPrivate) + c;
    years.push({ age: age + 1, publicOnly: pub, withPrivate: pri });
  }
  const w = n(p.withdrawalPct, 0, 100) / 100;
  const incomePublicOnly = pub * w;
  const incomeWithPrivate = pri * w;
  return {
    years,
    endPublicOnly: pub,
    endWithPrivate: pri,
    difference: pri - pub,
    incomePublicOnly,
    incomeWithPrivate,
    incomeIncreasePct: incomePublicOnly > 0 ? (incomeWithPrivate / incomePublicOnly - 1) * 100 : 0,
  };
}

/** Ending-balance difference if every private sleeve beat public by the same premium (e.g. 0, 1, 2, 3%). */
export function premiumSensitivity(p: LabParams, premiums: number[] = [0, 1, 2, 3]): { premium: number; difference: number }[] {
  return premiums.map((x) => ({
    premium: x,
    difference: projectRetirement({ ...p, premiumPct: { privateEquity: x, privateRealAssets: x, privateCredit: x } }).difference,
  }));
}
