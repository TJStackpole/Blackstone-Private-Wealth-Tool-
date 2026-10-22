import gap from "@/data/addons/retirement-plus/gap.json";
import glide from "@/data/addons/retirement-plus/glidepath.json";
import model from "@/data/addons/retirement-plus/model.json";

export interface PaperSource {
  name: string;
  page: string;
  url: string;
}

export interface GlideRow {
  age: number;
  privateEquity: number;
  privateRealAssets: number;
  privateCredit: number;
  source: PaperSource;
}

export const GAP = gap as {
  sample: boolean;
  verify: string;
  headline: { pensions: { value: number; label: string; source: PaperSource }; dc: { value: number; label: string; source: PaperSource } };
  facts: { id: string; value: string; label: string; source: PaperSource }[];
};

export const GLIDE = glide as { sample: boolean; verify: string; privateTotalPct: number; note: string; rows: GlideRow[] };

type Cited = { value: number; source: PaperSource };
export const MODEL = model as {
  sample: boolean;
  verify: string;
  assumptions: Record<"startAge" | "retireAge" | "startSalary" | "raisePct" | "contribStartPct" | "contribEndPct" | "privatePct" | "withdrawalPct", Cited>;
  published: { publicOnly: number; withPrivate: number; incomePublicOnly: number; incomeWithPrivate: number; incomeIncreasePct: number; source: PaperSource; method: string };
  notes: string[];
};
