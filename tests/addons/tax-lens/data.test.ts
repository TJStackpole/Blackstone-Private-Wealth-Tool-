import { describe, expect, it } from "vitest";
import { TAX } from "@/lib/addons/tax-lens/data";

describe("tax-lens data", () => {
  it("each year's split adds to 100% and links to a BREIT annual report on EDGAR", () => {
    for (const y of TAX.rocHistory) {
      expect(y.roc + y.capitalGains + y.ordinary).toBeCloseTo(100, 6);
      expect(y.source.url).toMatch(/^https:\/\/www\.sec\.gov\/Archives\/edgar\/data\/1662972\//);
    }
  });
  it("defaults to the latest reported year's return-of-capital share, with a verify note", () => {
    const latest = [...TAX.rocHistory].sort((a, b) => b.year - a.year)[0];
    expect(TAX.defaultRoc.value).toBe(latest.roc);
    expect(TAX.defaultRoc.verify).toBeTruthy();
  });
  it("explains the other three funds instead of running the calculator for them", () => {
    expect(Object.keys(TAX.otherFunds).sort()).toEqual(["BCRED", "BXINFRA", "BXPE"]);
  });
});
