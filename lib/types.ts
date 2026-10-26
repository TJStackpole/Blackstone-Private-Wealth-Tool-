/** Shared data types. Every fund JSON in /data follows FundData. */

export type LayerId = "breit" | "bxinfra" | "bxpe" | "bcred" | "retirement";

/** Tabs are either one fund layer or the side-by-side "All funds" view. */
export type ViewId = LayerId | "all";

export interface Source {
  name: string;
  url: string;
  /** Where in the document, e.g. "Note 10" or "Part II, Item 2". */
  page?: string;
}


/** One slice of a breakdown: a sector, a region, a country group. */
export interface Share {
  key: string;
  label: string;
  /** Percent, as reported (or computed from the filing's own table). */
  pct: number;
  note?: string;
}

export interface Stat {
  label: string;
  value: string;
  note?: string;
  /** How it moved since the prior report ("+2.8%"), which way, and what it's compared with ("from $14.13 on Dec 31, 2025"). */
  change?: string;
  /** "none": a status or a count, not a change over time ("all filled", "126 sold"). */
  direction?: "up" | "down" | "flat" | "none";
  from?: string;
  sources?: Source[];
}

/** Which SEC filing the numbers came from. */
export interface FilingRef {
  form: string;
  period: string;
  filed: string;
  url: string;
  entity: string;
  cik: string;
}

/**
 * How far down the filing's geography goes, which decides how the layer is drawn.
 * us-region: NCREIF U.S. regions (BREIT). world-region: Americas / EMEA / APAC. country-group: the filing's country groups.
 */
export type GeoLevel = "us-region" | "world-region" | "country-group";

export interface Geography {
  level: GeoLevel;
  basis: string;
  items: Share[];
  /** Only BREIT: the largest states the filing names. */
  topStates?: { state: string; pct: number }[];
  /** Region split within each sector, where the filing's schedule allows it. */
  bySector?: Record<string, { key: string; pct: number }[]>;
  bySectorBasis?: string;
}

/** A named investment from BREIT's real estate table. */
export interface PropertyInvestment {
  name: string;
  sector: string;
  properties: number;
  location: string;
  states: string[];
  acquired: string;
  ownership: string;
  size: string;
  occupancy: string;
}

/** A holding the filing names, with its value. */
export interface NamedHolding {
  name: string;
  sector: string;
  geo?: string;
  fairValueMillions: number;
  pctOfNetAssets: number;
  note?: string;
}

/** A fact from outside the fund's own filings. Always cited on its own. */
export interface ThirdPartyFact {
  /** Sector this fact belongs to. Omit to show it for the whole fund. */
  appliesTo?: string;
  label: string;
  value: string;
  asOf?: string;
  source: Source;
}

/** One headline change in the latest quarter, with where it came from. */
export interface QuarterMove {
  label: string;
  value: string;
  /** What it's compared with, e.g. "from $47.6B on Dec 31, 2025". */
  from: string;
  change: string;
  /** "none": a status or a count, not a change over time ("all filled", "126 sold"). */
  direction: "up" | "down" | "flat" | "none";
  note?: string;
}

export interface FundData {
  fund: string;
  assetClass: string;
  /** Period end of the filing. */
  asOf: string;
  source: Source;
  filing: FilingRef;
  locationBasis: "property" | "region";
  summary: { headline: string; stats: Stat[] };
  /** When the fund's headline size isn't GAAP net assets (BREIT reports NAV), a sentence saying so, from the filing. */
  sizeNote?: string;
  sectorBasis: string;
  sectors: Share[];
  geography: Geography;
  investments?: PropertyInvestment[];
  investmentsNote?: string;
  topHoldings?: { basis: string; items: NamedHolding[] };
  thisQuarter?: string[];
  /** The latest quarter at a glance, shown under the fund title. When present, it replaces the thisQuarter bullets. */
  quarterSummary?: { period: string; asOf: string; source: Source; moreSources?: Source[]; items: QuarterMove[] };
  notDisclosed: string[];
  howItWorks?: { title: string; asOf: string; paragraphs: string[]; source?: Source };
  website?: { text: string; source: Source };
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

/** Four-part mix, in percent, summing to 100. */
export interface Mix {
  stocks: number;
  bonds: number;
  cash: number;
  private: number;
}

export interface Milestone {
  date: string;
  title: string;
  summary: string;
  source: Source;
}

/** Shape of /data/retirement.json. Everything here is illustrative. */
export interface RetirementData {
  illustrative: true;
  asOf: string;
  framing: string;
  sleeve: { minPct: number; maxPct: number; note: string };
  glidePath: { farYears: number; far: Mix; near: Mix };
  sleeveSources: { layerId: LayerId; label: string; fund: string; why: string }[];
  explainers: { title: string; body: string }[];
  milestones: Milestone[];
}
