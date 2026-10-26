import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { readFileSync } from "node:fs";
import CompareTable from "@/components/CompareTable";
import { COMPARE, COMPARE_ROWS } from "@/lib/compare";
import { LATEST } from "@/lib/latest";
import { FUNDS } from "@/lib/addons/shared/funds";

afterEach(cleanup);

describe("side-by-side comparison table", () => {
  it("has the requested rows, one cell per fund", () => {
    expect(COMPARE.rows.map((r) => r.id)).toEqual(["distribution", "management", "performance", "limit", "early", "prorated", "minimum", "navChange"]);
    for (const r of COMPARE.rows) expect(Object.keys(r.cells).sort()).toEqual([...COMPARE.funds].sort());
  });
  it("sources every figure to a filing, and says 'Not in filing' with where it would come from otherwise", () => {
    const missingDoc = readFileSync("MISSING_DATA.md", "utf8");
    for (const r of [...COMPARE.rows, ...COMPARE_ROWS])
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
  it("NAV changes match the two prices in each note (the 10-Q's row and the monthly one)", () => {
    for (const c of [...Object.values(COMPARE.rows.find((r) => r.id === "navChange")!.cells), ...Object.values(LATEST.compare.navChange.cells)]) {
      const [dec, jun] = c!.note!.match(/\$([\d.]+) → \$([\d.]+)/)!.slice(1).map(Number);
      const pct = (jun / dec - 1) * 100;
      expect(Number(c!.value!.replace("−", "-").replace("%", ""))).toBeCloseTo(pct, 0);
    }
  });
  it("leads with size and the latest value per share (with its change since Dec 31), then the 10-Q rows", () => {
    expect(COMPARE_ROWS.map((r) => r.id)).toEqual(["size", "value", "distribution", "management", "performance", "limit", "early", "prorated", "minimum"]);
    const value = COMPARE_ROWS.find((r) => r.id === "value")!;
    for (const [f, c] of Object.entries(LATEST.compare.navChange.cells)) {
      expect(value.cells[f as keyof typeof value.cells].note).toContain(`${c!.value} since Dec 31, 2025`);
      expect(value.cells[f as keyof typeof value.cells].sources!.some((s) => /8-K|424B3/.test(s.name))).toBe(true);
    }
    expect(value.cells.BREIT.value).toBe("$14.65");
    expect(COMPARE_ROWS.find((r) => r.id === "size")!.cells.BCRED.value).toBe("$42.8B");
  });
  it("renders every row for all four funds on a wide screen, with 'Not in filing' for minimum investment", () => {
    render(<CompareTable />);
    const table = screen.getByRole("table");
    expect(within(table).getAllByRole("row")).toHaveLength(COMPARE_ROWS.length + 1);
    expect(within(table).getAllByText("Not in filing")).toHaveLength(4);
    expect(within(table).getByRole("rowheader", { name: /Buybacks pro-rated/ })).toBeTruthy();
  });
  it("can compare just two funds, and keeps at least two", () => {
    render(<CompareTable />);
    const picker = screen.getByRole("group", { name: /Funds to compare/ });
    fireEvent.click(within(picker).getByRole("button", { name: "BX Infra" }));
    fireEvent.click(within(picker).getByRole("button", { name: "BXPE" }));
    expect(document.querySelectorAll('[data-compare-row="size"] td')).toHaveLength(2);
    // A third click can't leave just one fund.
    fireEvent.click(within(picker).getByRole("button", { name: "BCRED" }));
    expect(document.querySelectorAll('[data-compare-row="size"] td')).toHaveLength(2);
  });
  it("keeps sources one switch away, and always on paper", () => {
    render(<CompareTable />);
    const src = document.querySelector('[data-compare-row="distribution"] [data-fund="BCRED"] p.text-muted') as HTMLElement;
    expect(src.className).toContain("hidden");
    expect(src.className).toContain("print:block");
    fireEvent.click(screen.getByRole("button", { name: "Show sources" }));
    expect((document.querySelector('[data-compare-row="distribution"] [data-fund="BCRED"] p.text-muted') as HTMLElement).className).not.toContain("hidden");
    // BXPE pays no distributions, so its cell stays the 10-Q's "None".
    expect(document.querySelector('[data-compare-row="distribution"] [data-fund="BXPE"]')!.textContent).toContain("None");
  });
});
