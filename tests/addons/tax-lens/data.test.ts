import { describe, expect, it } from "vitest";
import { TAX, TAX_FUNDS } from "@/lib/addons/tax-lens/data";

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
  it("covers BCRED, BXPE and BX Infra, each from its own filings", () => {
    const cik = { BCRED: "1803498", BXPE: "1930054", BXINFRA: "2030772" } as const;
    expect(Object.keys(TAX_FUNDS.funds).sort()).toEqual(["BCRED", "BXINFRA", "BXPE"]);
    for (const [f, facts] of Object.entries(TAX_FUNDS.funds)) {
      expect(facts.tiles).toHaveLength(3);
      for (const t of facts.tiles) expect(t.source.url).toContain(`/edgar/data/${cik[f as keyof typeof cik]}/`);
      // Every point cites the fund's own filing, except the one IRS rule it explains.
      for (const p of facts.points) expect(p.source.url.includes(`/edgar/data/${cik[f as keyof typeof cik]}/`) || p.source.url.startsWith("https://www.irs.gov/")).toBe(true);
    }
  });
  it("doesn't reuse BREIT's explanation: BCRED is income when paid, the partnerships are K-1s", () => {
    expect(TAX_FUNDS.funds.BCRED.history!.rows.every((r) => r.ordinaryPct === 100)).toBe(true);
    expect(TAX_FUNDS.funds.BXPE.steps).toHaveLength(3);
    expect(TAX_FUNDS.funds.BXINFRA.steps).toHaveLength(3);
    expect(JSON.stringify(TAX_FUNDS)).not.toMatch(/return of capital: lowers|1099/);
  });
});
