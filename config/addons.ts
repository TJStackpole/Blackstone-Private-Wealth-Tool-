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
  | "reality-check"
  | "retirement-plus";

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
  /** The client question the tool answers, shown large on the Toolkit card. */
  question?: string;
  enabled: boolean;
  appliesTo: FundCode[];
  /** Highest phase completed. */
  phase: 1 | 2 | 3;
  /** "tab" add-ons upgrade a map tab instead of having a Toolkit page or fund chips (e.g. the 401(k) tab). */
  kind?: "tool" | "tab";
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
  "retirement-plus",
];

/** Filled in as add-ons are built. */
export const ADDONS: AddonDef[] = [
  {
    id: "liquidity",
    name: "Liquidity Simulator",
    shortName: "Liquidity",
    description: "Buybacks on a schedule, up to a set limit. See when the money arrives.",
    question: "Can I get my money out?",
    enabled: true,
    appliesTo: ["BREIT", "BCRED", "BXPE", "BXINFRA"],
    phase: 3,
  },
  {
    id: "index-vs-fund",
    name: "Index-to-Fund Translator",
    shortName: "Index vs fund",
    description: "From a brochure's index to each share class, step by step.",
    question: "What did the fund actually earn?",
    enabled: true,
    appliesTo: ["BREIT", "BCRED", "BXPE", "BXINFRA"],
    phase: 3,
  },
  {
    id: "tax-lens",
    name: "Tax Lens",
    shortName: "Tax Lens",
    description: "Return of capital defers tax on most of the payout until you sell.",
    question: "How are the payouts taxed?",
    enabled: true,
    appliesTo: ["BREIT"],
    phase: 3,
  },
  {
    id: "smoothing",
    name: "Why So Smooth?",
    shortName: "Why so smooth",
    description: "Appraised values vs. traded prices, side by side.",
    question: "Why is the value so steady?",
    enabled: true,
    appliesTo: ["BREIT", "BXINFRA", "BXPE"],
    phase: 3,
  },
  {
    id: "themes",
    name: "Theme Exposure",
    shortName: "Themes",
    description: "Themes like AI across all four funds, and a client's total.",
    question: "What am I really exposed to?",
    enabled: true,
    appliesTo: ["BREIT", "BCRED", "BXPE", "BXINFRA"],
    phase: 3,
  },
  {
    id: "drawdown-vs-evergreen",
    name: "Drawdown vs. Evergreen",
    shortName: "Vs. drawdown",
    description: "Invested on day one, with no capital calls. See how much more money is at work.",
    question: "Why evergreen?",
    enabled: true,
    appliesTo: ["BREIT", "BCRED", "BXPE", "BXINFRA"],
    phase: 3,
  },
  {
    id: "reality-check",
    name: "Reality Check",
    shortName: "Reality check",
    description: "Each fund's stated goals, next to its latest filing.",
    question: "Is each fund doing what it says?",
    enabled: true,
    appliesTo: ["BREIT", "BCRED", "BXPE", "BXINFRA"],
    phase: 3,
  },
  {
    id: "retirement-plus",
    name: "401(k) tab upgrade",
    shortName: "401(k)",
    description: "The 401(k) tab's story, published glidepath, Outcome Lab and audience views.",
    enabled: true,
    appliesTo: [],
    phase: 1,
    kind: "tab",
  },
];

/** Enabled add-ons that have their own Toolkit page (not tab upgrades). */
export function toolkitAddons(list: AddonDef[] = ADDONS): AddonDef[] {
  return enabledAddons(list).filter((a) => a.kind !== "tab");
}

export function enabledAddons(list: AddonDef[] = ADDONS): AddonDef[] {
  return list.filter((a) => a.enabled);
}

export function addonsForFund(fund: FundCode, list: AddonDef[] = ADDONS): AddonDef[] {
  return enabledAddons(list).filter((a) => a.appliesTo.includes(fund));
}

export function findAddon(id: string, list: AddonDef[] = ADDONS): AddonDef | undefined {
  return enabledAddons(list).find((a) => a.id === id);
}
