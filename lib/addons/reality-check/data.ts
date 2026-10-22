import type { FundCode } from "@/config/addons";
import type { AddonSource } from "@/lib/addons/shared/types";
import BREIT from "@/data/addons/reality-check/BREIT.json";
import BCRED from "@/data/addons/reality-check/BCRED.json";
import BXPE from "@/data/addons/reality-check/BXPE.json";
import BXINFRA from "@/data/addons/reality-check/BXINFRA.json";

export type Status = "consistent" | "watch" | "diverges";
export const STATUSES: Status[] = ["consistent", "watch", "diverges"];

export interface Claim {
  id: string;
  /** Paraphrased, with the document and page it comes from. */
  claim: string;
  claimSource: AddonSource;
  /** What data tests it. */
  metric: string;
  value: string;
  asOf: string;
  source: AddonSource;
  /** Set by a person, never by code. */
  status: Status;
  /** "draft" until TJ confirms it. */
  statusSetBy: "draft" | "TJ";
  context: string;
}

export interface FundClaims {
  fund: FundCode;
  sample: boolean;
  updated: string;
  note: string;
  claims: Claim[];
}

export const CLAIMS: Record<FundCode, FundClaims> = {
  BREIT: BREIT as FundClaims,
  BCRED: BCRED as FundClaims,
  BXPE: BXPE as FundClaims,
  BXINFRA: BXINFRA as FundClaims,
};

export const STATUS_LABEL: Record<Status, string> = { consistent: "Consistent", watch: "Worth watching", diverges: "Diverges" };
