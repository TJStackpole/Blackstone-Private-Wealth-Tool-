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
    description: "How redemption limits work, each fund's terms, and what happens to a request when the limit is hit.",
    enabled: true,
    appliesTo: ["BREIT", "BCRED", "BXPE", "BXINFRA"],
    phase: 3,
  },
  {
    id: "index-vs-fund",
    name: "Index-to-Fund Translator",
    shortName: "Index vs fund",
    description: "A brochure's index return next to what each share class of the fund reported, and the reasons they differ: fees, borrowing, cash, servicing fees and timing.",
    enabled: true,
    appliesTo: ["BREIT", "BCRED", "BXPE", "BXINFRA"],
    phase: 3,
  },
  {
    id: "tax-lens",
    name: "Tax Lens",
    shortName: "Tax Lens",
    description: "How return of capital is taxed now and at sale, using BREIT's year-by-year figures, with a note on how the other funds differ.",
    enabled: true,
    appliesTo: ["BREIT"],
    phase: 3,
  },
  {
    id: "smoothing",
    name: "Why So Smooth?",
    shortName: "Why so smooth",
    description: "Why appraisal-based values move less than traded prices, what that does and doesn't mean for risk, and how to explain it.",
    enabled: true,
    appliesTo: ["BREIT", "BXINFRA", "BXPE"],
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
