import { describe, expect, it } from "vitest";
import { CLAIMS } from "@/lib/addons/reality-check/data";
import { COLUMNS, claimsToCsv, parseCsv, rowsToClaims } from "@/lib/addons/reality-check/csv";
import { freshness } from "@/lib/addons/reality-check/freshness";

const header = COLUMNS.join(",");
const good = 'BCRED,bcred-x,"Aims to generate current income, mostly.",BCRED 10-K,https://www.sec.gov/a,Item 1,Metric,"$1.07",2026-06-30,BCRED 10-Q,https://www.sec.gov/b,Note 10,watch,draft,"Context that is long enough."';

describe("update spreadsheet", () => {
  it("round-trips the live data: export, then import, gives the same claims", () => {
    const { funds, errors } = rowsToClaims(claimsToCsv(Object.values(CLAIMS)), new Date("2026-10-21"));
    expect(errors).toEqual([]);
    for (const f of Object.values(CLAIMS)) expect(funds[f.fund]).toEqual(f.claims);
  });

  it("parses quoted fields with commas, quotes and line breaks", () => {
    expect(parseCsv('a,"b, c","d ""e""",f\r\n1,"2\n3",4,5')).toEqual([
      ["a", "b, c", 'd "e"', "f"],
      ["1", "2\n3", "4", "5"],
    ]);
  });

  it("accepts a good row", () => {
    const r = rowsToClaims(`${header}\n${good}\n`, new Date("2026-10-21"));
    expect(r.errors).toEqual([]);
    expect(r.funds.BCRED?.[0].value).toBe("$1.07");
  });

  it("rejects bad rows with a clear message naming the row and column", () => {
    const bad = good.replace("2026-06-30", "June 30").replace(",watch,", ",pass,").replace("https://www.sec.gov/b", "sec.gov/b");
    const r = rowsToClaims(`${header}\n${good}\n${bad}\n`, new Date("2026-10-21"));
    expect(r.errors).toContain("Row 3, as_of: must be a date like 2026-06-30");
    expect(r.errors.some((e) => e.startsWith("Row 3, status:"))).toBe(true);
    expect(r.errors.some((e) => e.startsWith("Row 3, source_url:"))).toBe(true);
  });

  it("rejects missing columns, future dates and duplicate ids", () => {
    expect(rowsToClaims("fund,id\nBCRED,x").errors[0]).toMatch(/^Missing column\(s\): claim,/);
    const future = good.replace("2026-06-30", "2027-01-01");
    expect(rowsToClaims(`${header}\n${future}\n`, new Date("2026-10-21")).errors).toContain("Row 2, as_of: is in the future");
    expect(rowsToClaims(`${header}\n${good}\n${good}\n`, new Date("2026-10-21")).errors).toContain('Row 3, id: "bcred-x" is used more than once');
    expect(rowsToClaims("").errors).toEqual(["The file is empty."]);
  });
});

describe("freshness", () => {
  const today = new Date("2026-10-21T12:00:00Z");
  it("is fresh under 45 days, aging from 45 to 90, stale over 90", () => {
    expect(freshness("2026-09-07", today).level).toBe("fresh"); // 44 days
    expect(freshness("2026-09-06", today).level).toBe("aging"); // 45
    expect(freshness("2026-07-23", today).level).toBe("aging"); // 90
    expect(freshness("2026-07-22", today).level).toBe("stale"); // 91
  });
  it("labels the age in days", () => {
    expect(freshness("2026-06-30", today).label).toBe("Stale · 113 days old");
  });
});

describe("review fix: impossible dates", () => {
  it("rejects a date that doesn't exist, like February 30", () => {
    const bad = good.replace("2026-06-30", "2026-02-30");
    expect(rowsToClaims(`${header}\n${bad}\n`, new Date("2026-10-21")).errors).toContain("Row 2, as_of: is not a real date");
  });
});
