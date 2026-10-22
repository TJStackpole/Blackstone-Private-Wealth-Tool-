import type { FundCode } from "@/config/addons";
import type { AddonSource } from "@/lib/addons/shared/types";
import BREIT from "@/data/addons/index-vs-fund/BREIT.json";
import BCRED from "@/data/addons/index-vs-fund/BCRED.json";
import BXPE from "@/data/addons/index-vs-fund/BXPE.json";
import BXINFRA from "@/data/addons/index-vs-fund/BXINFRA.json";

export type ShareClass = "I" | "D" | "S";
export const SHARE_CLASSES: ShareClass[] = ["I", "D", "S"];

export interface IndexInfo {
  name: string;
  measures: string;
  feeBasis: "gross" | "net";
  feeText: string;
  levered: boolean;
  leverageText: string;
  /** Null when the index isn't published free: no number is shown rather than an invented one. */
  return: { value: number; period: string; note?: string } | null;
  sample: boolean;
  asOf: string;
  verify?: string;
  source: AddonSource;
}

export interface ClassReturn {
  shareClass: ShareClass;
  value: number;
  period: string;
  asOf: string;
  source: AddonSource;
}

interface Sourced {
  asOf: string;
  verify?: string;
  source: AddonSource;
}

export interface IndexVsFund {
  fund: FundCode;
  asOf: string;
  index: IndexInfo;
  fundSide: { label: string; returns: ClassReturn[]; sample: boolean };
  fees: {
    management: Sourced & { value: number; unit: string };
    performance: Sourced & { value: number; hurdle: number; label: string; note: string };
    servicing: Sourced & Record<ShareClass, number> & { unit: string };
  };
  /** Fund-level borrowing as reported, when the filing gives one number for it. */
  leverage: (Pick<Sourced, "asOf" | "source"> & { value: number; text: string }) | null;
}

export const INDEX_VS_FUND: Record<FundCode, IndexVsFund> = {
  BREIT: BREIT as IndexVsFund,
  BCRED: BCRED as IndexVsFund,
  BXPE: BXPE as IndexVsFund,
  BXINFRA: BXINFRA as IndexVsFund,
};

export function returnFor(d: IndexVsFund, c: ShareClass): ClassReturn | undefined {
  return d.fundSide.returns.find((r) => r.shareClass === c);
}
