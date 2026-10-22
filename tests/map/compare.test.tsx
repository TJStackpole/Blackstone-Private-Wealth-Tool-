import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import { readFileSync } from "node:fs";
import CompareTable from "@/components/CompareTable";
import { COMPARE } from "@/lib/compare";
import { FUNDS } from "@/lib/addons/shared/funds";

afterEach(cleanup);

describe("side-by-side comparison table", () => {
  it("has the requested rows, one cell per fund", () => {
    expect(COMPARE.rows.map((r) => r.id)).toEqual(["distribution", "management", "performance", "limit", "prorated", "minimum", "navChange"]);
    for (const r of COMPARE.rows) expect(Object.keys(r.cells).sort()).toEqual([...COMPARE.funds].sort());
  });
  it("sources every figure to a filing, and says 'Not in filing' with where it would come from otherwise", () => {
    const missingDoc = readFileSync("MISSING_DATA.md", "utf8");
    for (const r of COMPARE.rows)
      for (const [f, c] of Object.entries(r.cells)) {
        if (c.value === null) {
          expect(c.missing).toBe("Not in filing");
          expect(c.where).toBeTruthy();
          expect(missingDoc).toContain(`| ${FUNDS[f as keyof typeof FUNDS].label} | ${r.label} |`);
        } else {
          expect(c.sources!.length).toBeGreaterThan(0);
          for (const s of c.sources!) expect(s.url).toMatch(/^https:\/\/www\.sec\.gov\//);
        }
      }
  });
  it("NAV changes match the two prices in each note", () => {
    for (const [, c] of Object.entries(COMPARE.rows.find((r) => r.id === "navChange")!.cells)) {
      const [dec, jun] = c.note!.match(/\$([\d.]+) → \$([\d.]+)/)!.slice(1).map(Number);
      const pct = (jun / dec - 1) * 100;
      expect(Number(c.value!.replace("−", "-").replace("%", ""))).toBeCloseTo(pct, 0);
    }
  });
  it("renders every row, with 'Not in filing' for minimum investment", () => {
    render(<CompareTable />);
    const table = screen.getByRole("table");
    expect(within(table).getAllByRole("row")).toHaveLength(COMPARE.rows.length + 1);
    expect(within(table).getAllByText("Not in filing")).toHaveLength(4);
    expect(within(table).getByRole("rowheader", { name: /Buybacks pro-rated/ })).toBeTruthy();
  });
});
