import { describe, expect, it } from "vitest";
import { projectTax, type TaxParams } from "@/lib/addons/tax-lens/roc";

const base: TaxParams = {
  invested: 100_000,
  distributionRatePct: 5,
  rocPct: 80,
  ordinaryRatePct: 37,
  capitalGainsRatePct: 20,
  stateRatePct: 0,
  years: 1,
  qrdDeduction: false,
};

describe("projectTax", () => {
  it("one year matches the hand calculation: $5,000 paid, $1,000 taxed now, basis down $4,000", () => {
    const r = projectTax(base);
    const y = r.rows[0];
    expect(y.cash).toBeCloseTo(5000, 6);
    expect(y.taxable).toBeCloseTo(1000, 6);
    expect(y.roc).toBeCloseTo(4000, 6);
    expect(y.taxNow).toBeCloseTo(370, 6);
    expect(y.basisEnd).toBeCloseTo(96_000, 6);
    // Sold at the price paid: the $4,000 of ROC comes back as a $4,000 gain, taxed at 20%.
    expect(r.gainOnSale).toBeCloseTo(4000, 6);
    expect(r.taxOnSale).toBeCloseTo(800, 6);
    expect(r.afterTaxTotal).toBeCloseTo(5000 - 370 + 100_000 - 800, 6);
  });

  it("ten years matches the hand calculation", () => {
    const r = projectTax({ ...base, years: 10, stateRatePct: 5 });
    expect(r.rows).toHaveLength(10);
    expect(r.totalCash).toBeCloseTo(50_000, 6);
    expect(r.rows.at(-1)!.basisEnd).toBeCloseTo(60_000, 6);
    expect(r.totalTaxNow).toBeCloseTo(10 * 1000 * 0.42, 6);
    expect(r.gainOnSale).toBeCloseTo(40_000, 6);
    expect(r.taxOnSale).toBeCloseTo(40_000 * 0.25, 6);
  });

  it("0% return of capital means every payout is taxed now and basis never moves", () => {
    const r = projectTax({ ...base, rocPct: 0, years: 5 });
    for (const y of r.rows) {
      expect(y.taxable).toBeCloseTo(y.cash, 9);
      expect(y.basisEnd).toBe(100_000);
    }
    expect(r.taxOnSale).toBe(0);
    expect(r.totalTaxNow).toBeCloseTo(r.taxIfAllTaxedNow, 9);
  });

  it("basis floors at zero; return of capital beyond it is taxed as a capital gain, and the projection says so", () => {
    const r = projectTax({ ...base, distributionRatePct: 30, rocPct: 100, years: 5 });
    expect(r.rows.every((y) => y.basisEnd >= 0)).toBe(true);
    expect(r.rows[3].basisStart).toBeCloseTo(10_000, 6);
    expect(r.rows[3].excessGain).toBeCloseTo(20_000, 6);
    expect(r.rows[3].taxNow).toBeCloseTo(20_000 * 0.2, 6);
    expect(r.rows[4].excessGain).toBeCloseTo(30_000, 6);
    expect(r.notes.join(" ")).toMatch(/Basis reached zero/);
  });

  it("the 199A toggle taxes only 80% of the dividend part", () => {
    const off = projectTax({ ...base, rocPct: 0 });
    const on = projectTax({ ...base, rocPct: 0, qrdDeduction: true });
    expect(on.totalTaxNow).toBeCloseTo(off.totalTaxNow * 0.8, 9);
  });

  it("a sale below basis owes nothing on the sale and says so", () => {
    const r = projectTax({ ...base, rocPct: 0, priceChangePct: -10, years: 2 });
    expect(r.gainOnSale).toBeLessThan(0);
    expect(r.taxOnSale).toBe(0);
    expect(r.notes.join(" ")).toMatch(/loss/);
  });

  it("zero years means no payouts and no tax", () => {
    const r = projectTax({ ...base, years: 0 });
    expect(r.rows).toHaveLength(0);
    expect(r.afterTaxTotal).toBe(100_000);
  });
});

describe("cgRateFor", () => {
  it("pairs an income bracket with a starting capital gains rate", async () => {
    const { cgRateFor } = await import("@/components/addons/tax-lens/Calculator");
    expect([cgRateFor(37), cgRateFor(35), cgRateFor(24), cgRateFor(12)]).toEqual([20, 15, 15, 0]);
  });
});

describe("review fix: capital gain distributions", () => {
  it("taxes the capital-gains part at the capital gains rate, not as ordinary income (BREIT 2023 split)", () => {
    // $250,000 at 4.6%: $11,500 paid. 85.01% ROC, 14.99% capital gains, 0% ordinary.
    const r = projectTax({ ...base, invested: 250_000, distributionRatePct: 4.6, rocPct: 85.01, capitalGainsSharePct: 14.99, qrdDeduction: true });
    const y = r.rows[0];
    expect(y.taxable).toBeCloseTo(0, 6);
    expect(y.capitalGainDist).toBeCloseTo(11_500 * 0.1499, 6);
    expect(y.taxNow).toBeCloseTo(11_500 * 0.1499 * 0.2, 6); // about $345
  });
  it("never lets ROC plus capital gains exceed the payout", () => {
    const y = projectTax({ ...base, rocPct: 90, capitalGainsSharePct: 50 }).rows[0];
    expect(y.roc + y.capitalGainDist + y.taxable).toBeCloseTo(y.cash, 9);
    expect(y.taxable).toBeGreaterThanOrEqual(0);
  });
});
