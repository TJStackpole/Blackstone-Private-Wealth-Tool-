import { describe, expect, it } from "vitest";
import { CLAIMS, STATUSES } from "@/lib/addons/reality-check/data";

describe("reality-check data", () => {
  it("has at least three claims per fund, each with a claim source, a data source on EDGAR, a date and a valid status", () => {
    for (const d of Object.values(CLAIMS)) {
      expect(d.claims.length, d.fund).toBeGreaterThanOrEqual(3);
      for (const c of d.claims) {
        expect(c.claimSource.url).toMatch(/^https:\/\/www\.sec\.gov\//);
        expect(c.source.url).toMatch(/^https:\/\/www\.sec\.gov\//);
        expect(c.asOf).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(STATUSES).toContain(c.status);
        expect(["draft", "TJ"]).toContain(c.statusSetBy);
      }
    }
  });
  it("uses neutral wording", () => {
    expect(JSON.stringify(CLAIMS)).not.toMatch(/you should|we recommend|\bfail(ed|s)?\b/i);
  });
});
