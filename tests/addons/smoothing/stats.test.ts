import { describe, expect, it } from "vitest";
import { desmooth, levels, maxDrawdown, smooth, volatility } from "@/lib/addons/smoothing/stats";

describe("smoothing stats", () => {
  it("a flat series has zero volatility", () => {
    expect(volatility([0.02, 0.02, 0.02, 0.02])).toBe(0);
    expect(volatility([0.05])).toBe(0);
  });

  it("annualizes quarterly volatility by √4", () => {
    // Sample s.d. of [0.1, -0.1] is √0.02 = 0.141421…; annualized ×2.
    expect(volatility([0.1, -0.1])).toBeCloseTo(Math.sqrt(0.02) * 2, 12);
  });

  it("drawdown matches a hand calculation", () => {
    // Levels: 1 → 1.1 → 0.88 → 0.924 → 0.8316. Peak 1.1 (index 1), trough 0.8316 (index 4): 1 − 0.8316/1.1 = 24.4%.
    const d = maxDrawdown([0.1, -0.2, 0.05, -0.1]);
    expect(d.drawdown).toBeCloseTo(1 - 0.8316 / 1.1, 12);
    expect(d.peak).toBe(1);
    expect(d.trough).toBe(4);
  });

  it("a series that only rises has no drawdown", () => {
    expect(maxDrawdown([0.01, 0.02, 0.03]).drawdown).toBe(0);
  });

  it("alpha = 0 returns the original series", () => {
    const r = [0.03, -0.05, 0.02];
    expect(desmooth(r, 0)).toEqual(r);
  });

  it("desmoothing undoes smoothing at the same alpha", () => {
    const truth = [0.04, -0.12, 0.06, 0.01, -0.03, 0.08];
    const back = desmooth(smooth(truth, 0.6), 0.6);
    back.forEach((v, i) => expect(v).toBeCloseTo(truth[i], 12));
  });

  it("desmoothing widens the swings of a smoothed series", () => {
    const truth = [0.04, -0.12, 0.06, 0.01, -0.03, 0.08, -0.09, 0.05];
    const s = smooth(truth, 0.7);
    expect(volatility(desmooth(s, 0.7))).toBeGreaterThan(volatility(s));
  });

  it("levels start at the given value", () => {
    const lv = levels([0.1], 100);
    expect(lv[0]).toBe(100);
    expect(lv[1]).toBeCloseTo(110, 12);
  });
});

describe("sample series", () => {
  it("is flagged as sample, lines up quarter for quarter, and desmooths back to a wider-swinging series", async () => {
    const { SERIES } = await import("@/lib/addons/smoothing/data");
    expect(SERIES.sample).toBe(true);
    expect(SERIES.appraised.returns).toHaveLength(SERIES.quarters.length);
    expect(SERIES.traded.returns).toHaveLength(SERIES.quarters.length);
    expect(volatility(SERIES.appraised.returns)).toBeLessThan(volatility(SERIES.traded.returns));
    expect(volatility(desmooth(SERIES.appraised.returns, SERIES.builtWithAlpha))).toBeGreaterThan(volatility(SERIES.appraised.returns));
  });
});
