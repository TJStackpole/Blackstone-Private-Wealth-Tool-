import { describe, expect, it } from "vitest";
import { INDEX_VS_FUND, SHARE_CLASSES, returnFor } from "@/lib/addons/index-vs-fund/data";
import { reasonsFor } from "@/components/addons/index-vs-fund/WhyTheyDiffer";

const funds = Object.values(INDEX_VS_FUND);

describe("index-vs-fund data", () => {
  it("covers all four funds, each with a return for every share class from its SEC filing", () => {
    expect(funds.map((d) => d.fund).sort()).toEqual(["BCRED", "BREIT", "BXINFRA", "BXPE"]);
    for (const d of funds) {
      expect(d.fundSide.sample).toBe(false);
      for (const c of SHARE_CLASSES) {
        const r = returnFor(d, c);
        expect(r, `${d.fund} class ${c}`).toBeDefined();
        expect(r!.source.url).toMatch(/^https:\/\/www\.sec\.gov\/Archives\//);
        expect(r!.asOf).toBe("2026-06-30");
      }
    }
  });

  it("marks index figures as sample and gives every one a source and a verify note", () => {
    for (const d of funds) {
      expect(d.index.sample).toBe(true);
      expect(d.index.source.url).toMatch(/^https:\/\//);
      expect(d.index.verify).toBeTruthy();
    }
  });

  it("shows no index number where none is published free, rather than inventing one", () => {
    expect(INDEX_VS_FUND.BXINFRA.index.return).toBeNull();
  });

  it("carries fee terms as sourced parameters: servicing fees rise from Class I to D to S", () => {
    for (const d of funds) {
      const s = d.fees.servicing;
      expect([s.I, s.D, s.S]).toEqual([0, 0.25, 0.85]);
      expect(d.fees.management.value).toBe(1.25);
      expect(d.fees.management.verify).toBe("Confirm against current prospectus");
    }
  });

  it("explains a period mismatch only when the periods actually differ", () => {
    const titles = (f: keyof typeof INDEX_VS_FUND) => reasonsFor(INDEX_VS_FUND[f]).map((r) => r.title);
    expect(titles("BREIT")).toContain("Different periods");
    expect(titles("BCRED")).not.toContain("Different periods");
    expect(titles("BXINFRA")).not.toContain("Different periods");
  });
});

describe("leverageGap", () => {
  it("starts the bridge from the difference in reported leverage when both are known, else zero", async () => {
    const { leverageGap } = await import("@/lib/addons/index-vs-fund/data");
    expect(leverageGap(INDEX_VS_FUND.BCRED)).toBe(45);
    expect(leverageGap(INDEX_VS_FUND.BREIT)).toBe(23.2);
    expect(leverageGap(INDEX_VS_FUND.BXPE)).toBe(0);
    expect(leverageGap(INDEX_VS_FUND.BXINFRA)).toBe(0);
  });
});
