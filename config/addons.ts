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
  /**
   * "tool" (the default): its own Toolkit page and fund chips. "tab": upgrades a map tab (the 401(k) lens). "map": lives
   * on the map itself (the theme row). "moved": merged into another tool; its old address forwards to `movedTo`.
   */
  kind?: "tool" | "tab" | "map" | "moved";
  /** Where a moved add-on lives now, e.g. "/toolkit/liquidity#structure". */
  movedTo?: string;
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
    name: "Getting money out",
    shortName: "Money out",
    description: "How buybacks work, each fund's limits and what has happened when requests ran over them, and how an evergreen fund compares with a drawdown fund.",
    question: "Can my client get their money out?",
    enabled: true,
    appliesTo: ["BREIT", "BCRED", "BXPE", "BXINFRA"],
    phase: 3,
  },
  {
    id: "index-vs-fund",
    name: "Index-to-Fund Translator",
    shortName: "Index vs fund",
    description: "Now part of Returns, explained.",
    enabled: true,
    appliesTo: [],
    phase: 3,
    kind: "moved",
    movedTo: "/toolkit/smoothing#index",
  },
  {
    id: "tax-lens",
    name: "Taxes",
    shortName: "Taxes",
    description: "How each fund's payouts are taxed, and what a client would owe now and at sale: federal, the investment income tax and their state.",
    question: "How are the payouts taxed?",
    enabled: true,
    appliesTo: ["BREIT", "BCRED", "BXPE", "BXINFRA"],
    phase: 3,
  },
  {
    id: "smoothing",
    name: "Returns, explained",
    shortName: "Returns",
    description: "Why appraised values move gently, and how an index's return becomes a share class's return after fees and borrowing.",
    question: "Why do the returns look the way they do?",
    enabled: true,
    appliesTo: ["BREIT", "BCRED", "BXPE", "BXINFRA"],
    phase: 3,
  },
  {
    id: "themes",
    name: "Theme Exposure",
    shortName: "Themes",
    description: "Lives on the map: the theme row above each fund's map.",
    enabled: true,
    appliesTo: [],
    phase: 3,
    kind: "map",
    movedTo: "/?view=breit&theme=ai-data-centers&details=1",
  },
  {
    id: "drawdown-vs-evergreen",
    name: "Drawdown vs. Evergreen",
    shortName: "Drawdown",
    description: "Now part of Getting money out.",
    enabled: true,
    appliesTo: [],
    phase: 3,
    kind: "moved",
    movedTo: "/toolkit/liquidity#structure",
  },
  {
    id: "reality-check",
    name: "Goals vs. results",
    shortName: "Goals check",
    description: "Each fund's own stated goals next to what its latest filing shows, with a line on how to explain it to a client.",
    question: "Does it do what it says?",
    enabled: true,
    appliesTo: ["BREIT", "BCRED", "BXPE", "BXINFRA"],
    phase: 3,
  },
  {
    id: "retirement-plus",
    name: "401(k) lens",
    shortName: "401(k) lens",
    description: "Why private markets are mostly missing from 401(k)s, a published glidepath and an Outcome Lab, on the map's Retirement tab.",
    question: "What about my 401(k)?",
    enabled: true,
    appliesTo: [],
    phase: 1,
    kind: "tab",
  },
];

/** Where an add-on lives: its own Toolkit page, or (a tab upgrade) the map's tab it upgrades. */
export function addonHref(a: AddonDef): string {
  return a.kind === "tab" ? "/?view=retirement" : `/toolkit/${a.id}`;
}

/** Enabled add-ons that have their own Toolkit page (not tab upgrades, map features or merged ones). */
export function toolkitAddons(list: AddonDef[] = ADDONS): AddonDef[] {
  return enabledAddons(list).filter((a) => !a.kind || a.kind === "tool");
}

export function enabledAddons(list: AddonDef[] = ADDONS): AddonDef[] {
  return list.filter((a) => a.enabled);
}

export function addonsForFund(fund: FundCode, list: AddonDef[] = ADDONS): AddonDef[] {
  return toolkitAddons(list).filter((a) => a.appliesTo.includes(fund));
}

export function findAddon(id: string, list: AddonDef[] = ADDONS): AddonDef | undefined {
  return enabledAddons(list).find((a) => a.id === id);
}
