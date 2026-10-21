import { describe, expect, it } from "vitest";
import { cashWithin, headline, simulateRedemption, type SimParams } from "@/lib/addons/liquidity/simulate";

const base: SimParams = { amount: 100, quarters: 4, limitPct: 5, requestsPct: [10], resubmit: true, navChangePct: 0, earlyDeductionPct: 0 };

describe("simulateRedemption", () => {
  it("fills 100% when requests are under the limit", () => {
    const rows = simulateRedemption({ ...base, requestsPct: [3] });
    expect(rows[0].fillRate).toBe(1);
    expect(rows[0].cash).toBe(100);
    expect(rows[1].requested).toBe(0);
  });

  it("fills 50% when requests are twice the limit", () => {
    expect(simulateRedemption(base)[0].fillRate).toBe(0.5);
  });

  it("matches a hand-checked resubmission case: 50 + 25 + 12.5", () => {
    const rows = simulateRedemption({ ...base, quarters: 3 });
    expect(rows.map((r) => r.cash)).toEqual([50, 25, 12.5]);
    expect(rows[2].cumulativeCash).toBe(87.5);
    expect(rows[2].remaining).toBe(12.5);
  });

  it("without resubmitting, only the first quarter pays and the rest stays invested", () => {
    const rows = simulateRedemption({ ...base, resubmit: false });
    expect(rows[0].cash).toBe(50);
    expect(rows.slice(1).every((r) => r.cash === 0)).toBe(true);
    expect(rows[3].remaining).toBe(50);
  });

  it("never pays out more than was requested", () => {
    for (const req of [1, 5, 7.5, 10, 25, 100]) {
      for (const q of [1, 4, 12]) {
        const rows = simulateRedemption({ ...base, requestsPct: [req, req / 2], quarters: q });
        const paid = rows.reduce((t, r) => t + r.gross, 0);
        expect(paid).toBeLessThanOrEqual(100 + 1e-9);
        expect(rows.every((r) => r.remaining >= -1e-9)).toBe(true);
      }
    }
  });

  it("applies the early deduction to each payout", () => {
    const rows = simulateRedemption({ ...base, requestsPct: [3], earlyDeductionPct: 2 });
    expect(rows[0].deduction).toBeCloseTo(2);
    expect(rows[0].cash).toBeCloseTo(98);
  });

  it("revalues the unfilled part each quarter", () => {
    const rows = simulateRedemption({ ...base, quarters: 2, navChangePct: -10 });
    expect(rows[1].requested).toBeCloseTo(45); // 50 left, down 10%
  });

  it("handles zero and negative amounts without paying anything", () => {
    expect(simulateRedemption({ ...base, amount: 0 }).every((r) => r.cash === 0)).toBe(true);
    expect(simulateRedemption({ ...base, amount: -5 }).every((r) => r.cash === 0)).toBe(true);
  });
});

describe("headline", () => {
  it("states the same number the table shows", () => {
    const rows = simulateRedemption({ ...base, amount: 500_000 });
    expect(cashWithin(rows, 6)).toBe(375_000);
    expect(headline(rows, 6)).toBe("In this scenario, you'd receive about $375,000 within 6 months.");
  });
});
