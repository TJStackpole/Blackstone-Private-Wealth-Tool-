import raw from "@/data/addons/tax-lens/states.json";
import type { AddonSource } from "@/lib/addons/shared/types";

export interface StateRate {
  code: string;
  name: string;
  /** Top rate on income, percent. 0 where the state has no income tax (or, Washington, taxes capital gains only). */
  top: number;
  /** Joint taxable income where the top rate starts. Absent where there's no tax. */
  from?: number;
  /** One rate for all income. */
  flat?: boolean;
  note?: string;
}

/** Each state's top income tax rate (built by scripts/tax/state_rates.py from the Tax Foundation's table). */
export const STATES = raw as { asOf: string; source: AddonSource; basis: string; default: string; states: StateRate[] };

export function stateRate(code: string): StateRate {
  return STATES.states.find((s) => s.code === code) ?? STATES.states.find((s) => s.code === STATES.default)!;
}

/** "Illinois: one rate, 4.95%, on all income" / "California: 13.3% top rate, from $1,485,906 of joint income". */
export function stateRateLine(s: StateRate): string {
  if (s.note) return `${s.name}: ${s.note}`;
  if (s.flat) return `${s.name}: one rate, ${s.top}%, on ${s.from ? `income over $${s.from.toLocaleString("en-US")}` : "all income"}`;
  return `${s.name}: ${s.top}% top rate, from $${s.from!.toLocaleString("en-US")} of joint taxable income; lower brackets apply below that`;
}
