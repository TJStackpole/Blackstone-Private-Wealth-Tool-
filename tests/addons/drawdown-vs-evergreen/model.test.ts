import { describe, expect, it } from "vitest";
import { DEFAULTS, compare, type CompareParams } from "@/lib/addons/drawdown-vs-evergreen/model";

const same: CompareParams = { ...DEFAULTS, drawdownFeePct: 0, evergreenFeePct: 0, distributionStartYear: 99 };

describe("compare", () => {
  it("a 100% day-one call makes both structures identical before fees", () => {
    const r = compare({ ...same, callSchedulePct: [100] });
    for (const y of r.rows) {
      expect(y.drawdownAtWorkPct).toBe(100);
      expect(y.drawdownValue).toBeCloseTo(y.evergreenValue, 6);
    }
  });

  it("the default 25%-a-year schedule puts 25%, then more, of the money to work", () => {
    const r = compare(same);
    expect(r.rows[0].drawdownAtWorkPct).toBeCloseTo(25, 9);
    expect(r.rows[1].drawdownAtWorkPct).toBeGreaterThan(25);
    // Interest earned while waiting stays in cash, so the share ends just under 100%; with no interest it's exactly 100%.
    expect(r.rows[3].drawdownAtWorkPct).toBeGreaterThan(90);
    expect(r.rows[3].drawdownAtWorkPct).toBeLessThan(100);
    expect(compare({ ...same, cashYieldPct: 0 }).rows[3].drawdownAtWorkPct).toBeCloseTo(100, 9);
  });

  it("matches a hand calculation for year one", () => {
    // $10M: $2.5M called and grows 9% to $2.725M; $7.5M of cash grows 4% to $7.8M. Total $10.525M; evergreen $10.9M.
    const r = compare(same);
    expect(r.rows[0].drawdownValue).toBeCloseTo(10_525_000, 4);
    expect(r.rows[0].evergreenValue).toBeCloseTo(10_900_000, 4);
  });

  it("with zero cash yield, uncalled money neither grows nor shrinks", () => {
    const r = compare({ ...same, cashYieldPct: 0, assetReturnPct: 0 });
    for (const y of r.rows) expect(y.drawdownValue).toBeCloseTo(10_000_000, 4);
  });

  it("higher fees always mean a lower ending value", () => {
    const ends = [0, 0.5, 1, 1.5, 2, 3].map((f) => compare({ ...DEFAULTS, drawdownFeePct: f, evergreenFeePct: f }));
    for (let i = 1; i < ends.length; i++) {
      expect(ends[i].drawdownEnd).toBeLessThan(ends[i - 1].drawdownEnd);
      expect(ends[i].evergreenEnd).toBeLessThan(ends[i - 1].evergreenEnd);
    }
  });

  it("distributions move money back to cash, lowering the share at work", () => {
    const r = compare({ ...same, distributionStartYear: 5, distributionPct: 20 });
    expect(r.rows[5].drawdownAtWorkPct).toBeLessThan(100);
  });

  it("never calls more than the commitment, and handles empty input", () => {
    const r = compare({ ...same, cashYieldPct: 0, callSchedulePct: [80, 80, 80] });
    expect(r.rows[1].drawdownAtWorkPct).toBeCloseTo(100, 9);
    expect(r.rows[2].drawdownAtWorkPct).toBeCloseTo(100, 9);
    expect(r.rows[1].drawdownValue).toBeGreaterThan(0);
    const z = compare({ ...same, commitment: 0 });
    expect(z.drawdownEnd).toBe(0);
    expect(compare({ ...same, years: 0 }).rows).toHaveLength(0);
  });
});

describe("review fix: same fee basis", () => {
  it("identical inputs give identical results, fees included", () => {
    const r = compare({ ...DEFAULTS, callSchedulePct: [100], drawdownFeePct: 1.25, evergreenFeePct: 1.25, drawdownFeeOnCommitment: false, distributionStartYear: 99 });
    for (const y of r.rows) expect(y.drawdownValue).toBeCloseTo(y.evergreenValue, 6);
  });
});
