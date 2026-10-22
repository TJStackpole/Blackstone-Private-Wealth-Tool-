import type { FundCode } from "@/config/addons";
import type { AddonSource, FundParam } from "@/lib/addons/shared/types";
import termsJson from "@/data/addons/liquidity/terms.json";
import historyJson from "@/data/addons/liquidity/history.json";

export interface FundLimit extends FundParam<number> {
  label: string;
  unit: string;
}

export interface FundTerms {
  fund: FundCode;
  howOften: string;
  limits: FundLimit[];
  earlyDeduction: FundParam<number> & { heldUnder: string };
  discretion: string;
}

export interface CapEvent {
  date: string;
  fund: FundCode;
  title: string;
  detail: string;
  source: AddonSource;
  /** Share of requests filled, as the filing states it; filledApprox when worked out from the amounts it gives. */
  filledPct?: number;
  filledApprox?: boolean;
}

export const TERMS = termsJson as { asOf: string; sample: boolean; source: AddonSource; funds: FundTerms[] };
export const HISTORY = historyJson as { asOf: string; sample: boolean; events: CapEvent[] };

export function termsFor(fund: FundCode): FundTerms | undefined {
  return TERMS.funds.find((f) => f.fund === fund);
}

/** The quarterly limit a simulation should start from, in percent. */
export function quarterlyLimit(fund: FundCode): FundLimit | undefined {
  const t = termsFor(fund);
  return t?.limits.find((l) => /quarter/i.test(l.label));
}
