import type { AddonDef, AddonId } from "@/config/addons";

export type Audience = "advisor" | "family-office";

/** Family Office mode puts these first on the Toolkit home (Add-on 7, Phase 3). */
export const FAMILY_OFFICE_FIRST: AddonId[] = ["drawdown-vs-evergreen", "themes", "index-vs-fund"];

/** Toolkit order for an audience: unchanged for advisors; for family offices, the three above first, the rest in their usual order. */
export function orderFor(audience: Audience, list: AddonDef[]): AddonDef[] {
  if (audience === "advisor") return list;
  const rank = (a: AddonDef) => {
    const i = FAMILY_OFFICE_FIRST.indexOf(a.id);
    return i === -1 ? FAMILY_OFFICE_FIRST.length : i;
  };
  return list.map((a, i) => ({ a, i })).sort((x, y) => rank(x.a) - rank(y.a) || x.i - y.i).map((x) => x.a);
}
