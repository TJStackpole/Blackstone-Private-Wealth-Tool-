import { describe, expect, it } from "vitest";
import { HISTORY, TERMS, quarterlyLimit } from "@/lib/addons/liquidity/data";
import { proRataFill } from "@/lib/addons/liquidity/prorata";

describe("liquidity data honesty", () => {
  it("every fund term is a parameter with a source, an as-of date and a verify note", () => {
    for (const f of TERMS.funds) {
      for (const p of [...f.limits, f.earlyDeduction]) {
        expect(p.source.url).toMatch(/^https:\/\/www\.sec\.gov\//);
        expect(p.asOf).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(p.verify).toBeTruthy();
      }
    }
  });

  it("covers all four funds, each with a quarterly limit", () => {
    expect(TERMS.funds.map((f) => f.fund).sort()).toEqual(["BCRED", "BREIT", "BXINFRA", "BXPE"]);
    for (const f of TERMS.funds) expect(quarterlyLimit(f.fund)?.value).toBeGreaterThan(0);
  });

  it("history events are dated, in order, and each cites an SEC filing", () => {
    const dates = HISTORY.events.map((e) => e.date);
    expect([...dates].sort()).toEqual(dates);
    for (const e of HISTORY.events) expect(e.source.url).toMatch(/^https:\/\/www\.sec\.gov\//);
  });
});

describe("proRataFill", () => {
  it("fills everything when requests are under the limit", () => {
    expect(proRataFill(5, 3)).toBe(1);
    expect(proRataFill(5, 5)).toBe(1);
  });
  it("fills half when requests are double the limit", () => {
    expect(proRataFill(5, 10)).toBe(0.5);
  });
  it("handles no requests and a zero limit", () => {
    expect(proRataFill(5, 0)).toBe(1);
    expect(proRataFill(0, 10)).toBe(0);
  });
});
