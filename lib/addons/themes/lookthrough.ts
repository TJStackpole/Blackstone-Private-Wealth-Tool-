import type { FundCode } from "@/config/addons";
import { THEMES, themeWeight, type Theme } from "./tags";

export interface OtherHolding {
  label: string;
  amount: number;
  /** Theme id the advisor assigns by hand, or null for untagged. */
  theme: string | null;
}

export interface Holdings {
  funds: Partial<Record<FundCode, number>>;
  others: OtherHolding[];
}

export interface ThemeSlice {
  id: string;
  label: string;
  amount: number;
  /** Share of the whole portfolio, 0–100. */
  pct: number;
}

export interface LookThrough {
  total: number;
  /** Every theme plus "Not in a theme", largest first. */
  slices: ThemeSlice[];
  largest: ThemeSlice | null;
}

export const UNTAGGED = "untagged";
const pos = (v: number) => (Number.isFinite(v) && v > 0 ? v : 0);

/**
 * Looks through each fund to its themes using the fund's published sector weights, adds outside holdings the advisor
 * has tagged, and reports dollars and share by theme. Whatever isn't in a theme is reported as "Not in a theme",
 * so the slices always add up to the total.
 */
export function lookThrough(h: Holdings, themes: Theme[] = THEMES, weight: (t: Theme, f: FundCode) => number = themeWeight): LookThrough {
  const amounts = new Map<string, number>(themes.map((t) => [t.id, 0]));
  let total = 0;
  let tagged = 0;
  for (const [f, raw] of Object.entries(h.funds) as [FundCode, number][]) {
    const amt = pos(raw);
    total += amt;
    for (const t of themes) {
      const a = (amt * weight(t, f)) / 100;
      amounts.set(t.id, (amounts.get(t.id) ?? 0) + a);
      tagged += a;
    }
  }
  for (const o of h.others) {
    const amt = pos(o.amount);
    total += amt;
    if (o.theme && amounts.has(o.theme)) {
      amounts.set(o.theme, amounts.get(o.theme)! + amt);
      tagged += amt;
    }
  }
  const slices: ThemeSlice[] = themes.map((t) => ({ id: t.id, label: t.label, amount: amounts.get(t.id)!, pct: total ? (amounts.get(t.id)! / total) * 100 : 0 }));
  slices.push({ id: UNTAGGED, label: "Not in a theme", amount: total - tagged, pct: total ? ((total - tagged) / total) * 100 : 0 });
  slices.sort((a, b) => b.amount - a.amount);
  const largest = slices.find((s) => s.id !== UNTAGGED && s.amount > 0) ?? null;
  return { total, slices, largest };
}

/** True when a theme's share is above the threshold the advisor set. */
export function isConcentrated(slice: ThemeSlice | null, thresholdPct: number): boolean {
  return !!slice && slice.id !== UNTAGGED && slice.pct > thresholdPct;
}
