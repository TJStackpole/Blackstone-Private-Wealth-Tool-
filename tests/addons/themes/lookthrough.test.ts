import { describe, expect, it } from "vitest";
import { UNTAGGED, isConcentrated, lookThrough } from "@/lib/addons/themes/lookthrough";
import { FUND_DATA, THEMES } from "@/lib/addons/themes/tags";
import type { FundCode } from "@/config/addons";

describe("lookThrough", () => {
  it("slices always add up to the total, with the remainder as 'Not in a theme'", () => {
    const r = lookThrough({ funds: { BREIT: 100_000, BXINFRA: 50_000, BXPE: 75_000, BCRED: 25_000 }, others: [{ label: "Cash", amount: 10_000, theme: null }] });
    expect(r.total).toBe(260_000);
    expect(r.slices.reduce((s, x) => s + x.amount, 0)).toBeCloseTo(260_000, 6);
    expect(r.slices.reduce((s, x) => s + x.pct, 0)).toBeCloseTo(100, 9);
  });

  it("uses each fund's published weights: $100,000 of BREIT is $27,000 of AI & data centers", () => {
    const r = lookThrough({ funds: { BREIT: 100_000 }, others: [] });
    expect(r.slices.find((s) => s.id === "ai-data-centers")!.amount).toBeCloseTo(27_000, 6);
    expect(r.slices.find((s) => s.id === "housing")!.amount).toBeCloseTo(42_000, 6);
  });

  it("adds hand-tagged holdings to their theme: the four funds plus Nvidia example", () => {
    const r = lookThrough({
      funds: { BREIT: 250_000, BXINFRA: 250_000, BXPE: 250_000, BCRED: 250_000 },
      others: [{ label: "Nvidia stock", amount: 200_000, theme: "ai-data-centers" }],
    });
    // 250k × 27% + 250k × 24.1% + 200k = 327,750 of 1,200,000 = 27.3%
    const ai = r.slices.find((s) => s.id === "ai-data-centers")!;
    expect(ai.amount).toBeCloseTo(327_750, 6);
    expect(ai.pct).toBeCloseTo(27.3125, 6);
    expect(r.largest!.id).toBe("ai-data-centers");
    expect(isConcentrated(r.largest, 25)).toBe(true);
    expect(isConcentrated(r.largest, 30)).toBe(false);
  });

  it("handles empty input without dividing by zero", () => {
    const r = lookThrough({ funds: {}, others: [] });
    expect(r.total).toBe(0);
    expect(r.slices.every((s) => s.pct === 0 && s.amount === 0)).toBe(true);
    expect(r.largest).toBeNull();
    expect(isConcentrated(r.largest, 25)).toBe(false);
  });

  it("ignores negative or invalid amounts and unknown theme tags", () => {
    const r = lookThrough({ funds: { BREIT: -5 }, others: [{ label: "x", amount: Number.NaN, theme: "ai-data-centers" }, { label: "y", amount: 100, theme: "nope" }] });
    expect(r.total).toBe(100);
    expect(r.slices.find((s) => s.id === UNTAGGED)!.amount).toBe(100);
  });

  it("never counts the same sector in two themes for one fund", () => {
    for (const f of Object.keys(FUND_DATA) as FundCode[]) {
      const all = THEMES.flatMap((t) => t.sectors[f] ?? []);
      expect(new Set(all).size, f).toBe(all.length);
    }
  });
});
