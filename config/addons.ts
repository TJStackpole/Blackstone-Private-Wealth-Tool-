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
export const ADDONS: AddonDef[] = [
  {
    id: "liquidity",
    name: "Liquidity Simulator",
    shortName: "Liquidity",
    description: "When you'd get your money back if you sell, and each fund's limits.",
    enabled: true,
    appliesTo: ["BREIT", "BCRED", "BXPE", "BXINFRA"],
    phase: 3,
  },
  {
    id: "index-vs-fund",
    name: "Index-to-Fund Translator",
    shortName: "Index vs fund",
    description: "A brochure's index return next to what each share class actually earned.",
    enabled: true,
    appliesTo: ["BREIT", "BCRED", "BXPE", "BXINFRA"],
    phase: 3,
  },
  {
    id: "tax-lens",
    name: "Tax Lens",
    shortName: "Tax Lens",
    description: "Return of capital: what's taxed now, and what's taxed when you sell.",
    enabled: true,
    appliesTo: ["BREIT"],
    phase: 3,
  },
  {
    id: "smoothing",
    name: "Why So Smooth?",
    shortName: "Why so smooth",
    description: "Why private fund values move so gently, and what that does and doesn't mean.",
    enabled: true,
    appliesTo: ["BREIT", "BXINFRA", "BXPE"],
    phase: 3,
  },
  {
    id: "themes",
    name: "Theme Exposure",
    shortName: "Themes",
    description: "Themes like AI across funds, and what a set of holdings adds up to.",
    enabled: true,
    appliesTo: ["BREIT", "BCRED", "BXPE", "BXINFRA"],
    phase: 3,
  },
  {
    id: "drawdown-vs-evergreen",
    name: "Drawdown vs. Evergreen",
    shortName: "Vs. drawdown",
    description: "Traditional vs. evergreen private funds, and how much money is really at work.",
    enabled: true,
    appliesTo: ["BREIT", "BCRED", "BXPE", "BXINFRA"],
    phase: 3,
  },
  {
    id: "reality-check",
    name: "Reality Check",
    shortName: "Reality check",
    description: "Each fund's stated goals next to what its latest filing shows.",
    enabled: true,
    appliesTo: ["BREIT", "BCRED", "BXPE", "BXINFRA"],
    phase: 3,
  },
];

export function enabledAddons(list: AddonDef[] = ADDONS): AddonDef[] {
  return list.filter((a) => a.enabled);
}

export function addonsForFund(fund: FundCode, list: AddonDef[] = ADDONS): AddonDef[] {
  return enabledAddons(list).filter((a) => a.appliesTo.includes(fund));
}

export function findAddon(id: string, list: AddonDef[] = ADDONS): AddonDef | undefined {
  return enabledAddons(list).find((a) => a.id === id);
}
