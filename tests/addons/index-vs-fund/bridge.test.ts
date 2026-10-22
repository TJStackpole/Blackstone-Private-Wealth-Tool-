import { describe, expect, it } from "vitest";
import { buildBridge, type BridgeParams } from "@/lib/addons/index-vs-fund/bridge";

const base: BridgeParams = {
  indexReturn: 8,
  indexIsNet: false,
  extraLeveragePct: 40,
  borrowCostPct: 6,
  cashPct: 5,
  cashYieldPct: 4,
  managementFeePct: 1.25,
  performanceFeePct: 12.5,
  hurdlePct: 5,
  servicingFeePct: 0.85,
};
const sum = (b: ReturnType<typeof buildBridge>) => b.start + b.steps.reduce((s, x) => s + x.delta, 0);

describe("buildBridge", () => {
  it("steps always add up exactly from the start to the end, each starting where the last ended", () => {
    for (const p of [base, { ...base, indexReturn: -12 }, { ...base, extraLeveragePct: 0, cashPct: 0 }, { ...base, indexIsNet: true }]) {
      const b = buildBridge(p);
      expect(sum(b)).toBeCloseTo(b.end, 12);
      expect(b.steps[0].from).toBe(b.start);
      b.steps.slice(1).forEach((s, i) => expect(s.from).toBe(b.steps[i].to));
      expect(b.steps.at(-1)!.to).toBe(b.end);
    }
  });

  it("no fees, no borrowing and no cash means no change", () => {
    const b = buildBridge({ ...base, extraLeveragePct: 0, cashPct: 0, managementFeePct: 0, performanceFeePct: 0, servicingFeePct: 0 });
    expect(b.end).toBe(8);
    expect(b.steps.every((s) => s.delta === 0)).toBe(true);
  });

  it("matches a hand calculation", () => {
    // Borrowing: (8 − 6) × 0.4 / 0.6 = 1.3333 → 9.3333
    // Cash: −0.05 × (9.3333 − 4) = −0.2667 → 9.0667
    // Management: −1.25 → 7.8167
    // Performance: −0.125 × (7.8167 − 5) = −0.3521 → 7.4646
    // Servicing: −0.85 → 6.6146
    const b = buildBridge(base);
    const d = b.steps.map((s) => s.delta);
    expect(d[0]).toBeCloseTo(4 / 3, 10);
    expect(d[1]).toBeCloseTo(-0.05 * (8 + 4 / 3 - 4), 10);
    expect(d[2]).toBe(-1.25);
    expect(d[3]).toBeCloseTo(-0.125 * (8 + 4 / 3 - 0.05 * (8 + 4 / 3 - 4) - 1.25 - 5), 10);
    expect(d[4]).toBe(-0.85);
    expect(b.end).toBeCloseTo(6.6146, 4);
  });

  it("handles negative returns: borrowing deepens the loss, cash cushions it, no performance fee is charged", () => {
    const b = buildBridge({ ...base, indexReturn: -10 });
    const by = Object.fromEntries(b.steps.map((s) => [s.key, s.delta]));
    expect(by.leverage).toBeLessThan(0);
    expect(by.cash).toBeGreaterThan(0);
    expect(by.performance).toBe(0);
    expect(b.end).toBeLessThan(-10);
  });

  it("a share class with a higher servicing fee ends lower by exactly the fee difference", () => {
    const i = buildBridge({ ...base, servicingFeePct: 0 });
    const s = buildBridge({ ...base, servicingFeePct: 0.85 });
    expect(i.end - s.end).toBeCloseTo(0.85, 12);
  });

  it("an after-fee index skips the fund's own management and performance fee steps", () => {
    const b = buildBridge({ ...base, indexIsNet: true });
    const by = Object.fromEntries(b.steps.map((s) => [s.key, s.delta]));
    expect(by.management).toBe(0);
    expect(by.performance).toBe(0);
  });

  it("ignores impossible inputs instead of breaking", () => {
    const b = buildBridge({ ...base, extraLeveragePct: 150, cashPct: -5, indexReturn: Number.NaN });
    expect(Number.isFinite(b.end)).toBe(true);
    expect(b.start).toBe(0);
  });
});
