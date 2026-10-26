import type { FundCode } from "@/config/addons";
import type { AddonSource, FundParam } from "@/lib/addons/shared/types";
import raw from "@/data/addons/tax-lens/breit.json";
import fundsRaw from "@/data/addons/tax-lens/funds.json";

export interface RocYear {
  year: number;
  roc: number;
  capitalGains: number;
  ordinary: number;
  source: AddonSource;
}

export interface TaxLensData {
  asOf: string;
  sample: boolean;
  source: AddonSource;
  rocHistory: RocYear[];
  defaultRoc: FundParam<number>;
  distributionRates: Record<"I" | "D" | "S", FundParam<number>>;
  irs: { roc: AddonSource; qbi: AddonSource; niit: AddonSource; brackets: AddonSource };
}

export const TAX = raw as TaxLensData;

export type OtherFund = Exclude<FundCode, "BREIT">;

export interface FundTaxFacts {
  structure: string;
  /** A few words: how the payout is taxed. */
  summary: string;
  tiles: { value: string; label: string; source: AddonSource }[];
  points: { text: string; source: AddonSource }[];
  /** BCRED: distributions per share by year and the share that was ordinary income. */
  history?: { label: string; rows: { year: number; perShare: number; ordinaryPct: number }[]; source: AddonSource };
  /** Partnerships: how income reaches the investor's tax return. */
  steps?: { title: string; text: string }[];
  /** Round-number illustration inputs (BCRED). */
  example?: { distributionPct: number; bracketPct: number };
}

/** BCRED, BXPE and BX Infra: each taxed its own way, from its own filings. */
export const TAX_FUNDS = fundsRaw as { asOf: string; sample: boolean; verify: string; funds: Record<OtherFund, FundTaxFacts> };
