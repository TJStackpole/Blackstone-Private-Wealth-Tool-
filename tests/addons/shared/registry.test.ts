import { describe, expect, it } from "vitest";
import { ADDONS, ALL_ADDON_IDS, addonsForFund, enabledAddons, findAddon, type AddonDef } from "@/config/addons";
import { toFundCode } from "@/lib/addons/shared/funds";

const sample: AddonDef[] = [
  { id: "liquidity", name: "Liquidity Simulator", shortName: "Liquidity", description: "", enabled: true, appliesTo: ["BREIT", "BCRED"], phase: 1 },
  { id: "tax-lens", name: "Tax Lens", shortName: "Tax Lens", description: "", enabled: false, appliesTo: ["BREIT"], phase: 1 },
];

describe("add-on registry", () => {
  it("every registered add-on has a planned id and a chip label of 14 characters or fewer", () => {
    for (const a of ADDONS) {
      expect(ALL_ADDON_IDS).toContain(a.id);
      expect(a.shortName.length).toBeLessThanOrEqual(14);
    }
  });

  it("switched-off add-ons disappear everywhere", () => {
    expect(enabledAddons(sample).map((a) => a.id)).toEqual(["liquidity"]);
    expect(findAddon("tax-lens", sample)).toBeUndefined();
    expect(addonsForFund("BREIT", sample).map((a) => a.id)).toEqual(["liquidity"]);
  });

  it("only offers an add-on for the funds it applies to", () => {
    expect(addonsForFund("BXPE", sample)).toEqual([]);
    expect(addonsForFund("BCRED", sample).map((a) => a.id)).toEqual(["liquidity"]);
  });

  it("maps the map's layer ids to fund codes, and ignores non-fund layers", () => {
    expect(toFundCode("bxinfra")).toBe("BXINFRA");
    expect(toFundCode("BCRED")).toBe("BCRED");
    expect(toFundCode("retirement")).toBeUndefined();
  });
});
