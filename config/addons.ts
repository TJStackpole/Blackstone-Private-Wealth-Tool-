/**
 * The Advisor Toolkit registry: one entry per add-on, each with an on/off switch.
 * Setting `enabled: false` removes an add-on everywhere (Toolkit page, fund-panel chips, its own page)
 * without touching the map. See BUILD_PLAN_ADDONS.md, Rules 1–3.
 */

export type AddonId =
  | "liquidity"
  | "index-vs-fund"
  | "tax-lens"
  | "smoothing"
  | "themes"
  | "drawdown-vs-evergreen"
  | "reality-check";

/** Fund codes used by the add-ons. The Atlas's own layer ids map onto these in lib/addons/shared/funds.ts. */
export type FundCode = "BREIT" | "BCRED" | "BXPE" | "BXINFRA";

export interface AddonDef {
  id: AddonId;
  /** Shown on the Toolkit page and as the page title. */
  name: string;
  /** Chip label in the fund panel, 14 characters or fewer. */
  shortName: string;
  /** One plain sentence for the Toolkit card. */
  description: string;
  enabled: boolean;
  appliesTo: FundCode[];
  /** Highest phase completed. */
  phase: 1 | 2 | 3;
}

/** Every add-on id the plan defines, so pages can be pre-built for a static export. */
export const ALL_ADDON_IDS: AddonId[] = [
  "liquidity",
  "index-vs-fund",
  "tax-lens",
  "smoothing",
  "themes",
  "drawdown-vs-evergreen",
  "reality-check",
];

/** Filled in as add-ons are built. */
export const ADDONS: AddonDef[] = [];

export function enabledAddons(list: AddonDef[] = ADDONS): AddonDef[] {
  return list.filter((a) => a.enabled);
}

export function addonsForFund(fund: FundCode, list: AddonDef[] = ADDONS): AddonDef[] {
  return enabledAddons(list).filter((a) => a.appliesTo.includes(fund));
}

export function findAddon(id: string, list: AddonDef[] = ADDONS): AddonDef | undefined {
  return enabledAddons(list).find((a) => a.id === id);
}
