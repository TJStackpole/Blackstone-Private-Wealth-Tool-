import gap from "@/data/addons/retirement-plus/gap.json";
import glide from "@/data/addons/retirement-plus/glidepath.json";
import model from "@/data/addons/retirement-plus/model.json";
import regulatory from "@/data/addons/retirement-plus/regulatory.json";
import room from "@/data/addons/retirement-plus/room.json";

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

export interface Source {
  name: string;
  url: string;
  page?: string;
}

export type AudienceId = "worker" | "employer";

export interface Objection {
  id: string;
  title: string;
  question: string;
  /** perFund "fees": show each fund's own fee line (from data/compare.json) under the text. */
  concern: { text: string; sources: Source[]; perFund?: "fees" };
  response: { text: string; sources: Source[] };
  watch: string;
  /** Cross-link to another add-on; hidden when that add-on is off. */
  link?: { addon: string; href: string; label: string };
}

export const ROOM = room as {
  asOf: string;
  sample: boolean;
  verify: string;
  audiences: Record<AudienceId, { label: string; title: string; lede: string; concernsTitle: string; concernsLede: string; printTop: string[] }>;
  howItGetsIn: { points: { text: string; source: PaperSource }[] };
  objections: Objection[];
};

export interface RegEntry {
  date: string;
  title: string;
  summary: string;
  source: Source;
}

export const REGULATORY = regulatory as { asOf: string; sample: boolean; verify: string; entries: RegEntry[] };
