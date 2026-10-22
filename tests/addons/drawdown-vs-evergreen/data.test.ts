import { describe, expect, it } from "vitest";
import { COMPARE } from "@/lib/addons/drawdown-vs-evergreen/data";

describe("drawdown vs evergreen comparison", () => {
  it("covers the plan's eight topics, each with both sides and at least one source", () => {
    expect(COMPARE.rows.map((r) => r.topic)).toEqual([
      "Capital calls",
      "When money is invested",
      "The early-years dip (\"J-curve\")",
      "Liquidity",
      "Fee structure",
      "Reporting",
      "Paperwork",
      "Fund life",
    ]);
    for (const r of COMPARE.rows) {
      expect(r.drawdown.length).toBeGreaterThan(20);
      expect(r.evergreen.length).toBeGreaterThan(20);
      expect(r.sources.length).toBeGreaterThan(0);
    }
  });
  it("is balanced: the same number of situations for each structure, and no advice wording", () => {
    expect(COMPARE.fits.drawdown.length).toBe(COMPARE.fits.evergreen.length);
    expect(JSON.stringify(COMPARE)).not.toMatch(/you should|we recommend/i);
  });
});
