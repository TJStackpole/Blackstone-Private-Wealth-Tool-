import { describe, expect, it } from "vitest";
import { reserveSentence, yearsCovered } from "@/lib/addons/liquidity/reserve";

describe("yearsCovered", () => {
  it("divides liquid assets by annual spending", () => {
    expect(yearsCovered(500_000, 200_000)).toBe(2.5);
  });
  it("treats no spending as covered indefinitely and no assets as zero", () => {
    expect(yearsCovered(100_000, 0)).toBe(Infinity);
    expect(yearsCovered(0, 50_000)).toBe(0);
  });
  it("ignores negative and invalid inputs", () => {
    expect(yearsCovered(-5, 10)).toBe(0);
    expect(yearsCovered(Number.NaN, 10)).toBe(0);
    expect(yearsCovered(100, -10)).toBe(Infinity);
  });
});

describe("reserveSentence", () => {
  it("reads naturally across the range", () => {
    expect(reserveSentence(2.5)).toBe("About 2.5 years of spending covered without redeeming.");
    expect(reserveSentence(1)).toBe("About 1 year of spending covered without redeeming.");
    expect(reserveSentence(0.5)).toBe("About 6 months of spending covered without redeeming.");
    expect(reserveSentence(12.4)).toBe("About 12 years of spending covered without redeeming.");
    expect(reserveSentence(0)).toMatch(/No liquid reserve/);
    expect(reserveSentence(Infinity)).toMatch(/no need to redeem/);
  });
});

describe("reserveSentence wording", () => {
  it("says '1 month', not '1 months'", () => {
    expect(reserveSentence(10_000 / 150_000)).toBe("About 1 month of spending covered without redeeming.");
    // A couple of days' worth isn't rounded up to a month.
    expect(reserveSentence(1_000 / 150_000)).toBe("Less than a month of spending covered without redeeming.");
  });
});
