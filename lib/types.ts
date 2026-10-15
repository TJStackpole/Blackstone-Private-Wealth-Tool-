/** Shared data types. Every fund JSON in /data follows FundData. */

export type LayerId = "breit" | "bxinfra" | "bxpe" | "bcred" | "retirement";

/** Tabs are either one fund layer or the side-by-side "All funds" view. */
export type ViewId = LayerId | "all";

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

/** A fact from outside the fund's own filings. Always cited on its own. */
export interface ThirdPartyFact {
  /** Sector this fact belongs to, e.g. "Data Centers". Omit to show it for the whole fund. */
  appliesTo?: string;
  label: string;
  value: string;
  asOf?: string;
  source: Source;
  sample?: boolean;
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
  howItWorks?: { title: string; asOf: string; paragraphs: string[]; source?: Source };
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
