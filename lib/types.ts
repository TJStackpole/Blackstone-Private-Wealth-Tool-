/** Shared data types. Every fund JSON in /data follows FundData. */

export type LayerId = "breit" | "bxinfra" | "bxpe" | "bcred" | "retirement";

/** "property" = the asset itself sits here. "headquarters" = the company's HQ is here (a proxy). */
export type LocationBasis = "property" | "headquarters";

export interface Source {
  name: string;
  url: string;
}

export interface Company {
  name: string;
  sector: string;
  description: string;
  sample?: boolean;
}

export interface Holding {
  /** Metro name without state, e.g. "Dallas–Fort Worth". */
  metro: string;
  /** Two-letter state code, e.g. "TX". */
  state: string;
  lat: number;
  lng: number;
  sector: string;
  /** Share of the fund, in percent (4.1 = 4.1%). */
  weightPct: number;
  note?: string;
  /** True when this entry is a placeholder, not from a filing. */
  sample?: boolean;
  /** Later phases (BXPE, BCRED): disclosed companies headquartered here. */
  companies?: Company[];
}

export interface ThirdPartyFact {
  label: string;
  value: string;
  source: Source;
}

export interface FundData {
  fund: string;
  assetClass: string;
  /** ISO date the figures are as of. */
  asOf: string;
  source: Source;
  locationBasis: LocationBasis;
  summary: {
    navBillions: number | null;
    headline: string;
  };
  sectors: string[];
  holdings: Holding[];
  /** Optional plain-English block (used by later phases). */
  howItWorks?: { title: string; asOf: string; paragraphs: string[] };
  /** Optional third-party context, cited separately from the filing. */
  context?: ThirdPartyFact[];
}

export interface LayerDef {
  id: LayerId;
  /** Tab label, e.g. "Real Estate". */
  label: string;
  /** Fund ticker shown under the label, e.g. "BREIT". */
  fund: string;
  /** Accent on the light background. */
  color: string;
  /** Lighter accent that reads on the dark background. */
  colorDark: string;
  status: "active" | "coming-soon";
  /** Loaded JSON, undefined while the layer is coming soon. */
  data?: FundData;
  /** Extra caveats shown in the footer for this layer. */
  caveats?: string[];
}
