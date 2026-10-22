import type { FundCode } from "@/config/addons";
import type { AddonSource, FundParam } from "@/lib/addons/shared/types";
import raw from "@/data/addons/tax-lens/breit.json";

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
  irs: { roc: AddonSource; qbi: AddonSource };
  otherFunds: Record<Exclude<FundCode, "BREIT">, { structure: string; text: string; source: AddonSource }>;
}

export const TAX = raw as TaxLensData;
