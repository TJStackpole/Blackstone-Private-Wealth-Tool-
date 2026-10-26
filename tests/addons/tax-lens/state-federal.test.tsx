import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { combinedRates, projectTax, type TaxParams } from "@/lib/addons/tax-lens/roc";
import { STATES, stateRate } from "@/lib/addons/tax-lens/states";
import Calculator from "@/components/addons/tax-lens/Calculator";
import FundTax from "@/components/addons/tax-lens/FundTax";
import WorkedExample from "@/components/addons/tax-lens/WorkedExample";

afterEach(() => {
  cleanup();
  localStorage.clear();
});

const base: TaxParams = { invested: 100_000, distributionRatePct: 5, rocPct: 80, ordinaryRatePct: 37, capitalGainsRatePct: 20, stateRatePct: 4.95, years: 1, qrdDeduction: false };

describe("state rates (Tax Foundation table)", () => {
  it("covers all 50 states and DC once, each with a rate in range and the table's date", () => {
    expect(STATES.states).toHaveLength(51);
    expect(new Set(STATES.states.map((s) => s.code)).size).toBe(51);
    for (const s of STATES.states) {
      expect(s.top).toBeGreaterThanOrEqual(0);
      expect(s.top).toBeLessThan(15);
    }
    expect(STATES.asOf).toBe("2026-01-01");
    expect(STATES.source.url).toMatch(/^https:\/\/taxfoundation\.org\//);
  });
  it("reads the table's top rates: a few states checked by hand against it", () => {
    expect(stateRate("CA")).toMatchObject({ top: 13.3, from: 1_485_906 });
    expect(stateRate("NY")).toMatchObject({ top: 10.9, from: 25_000_000 });
    expect(stateRate("IL")).toMatchObject({ top: 4.95, flat: true });
    expect(stateRate("DC")).toMatchObject({ top: 10.75, from: 1_000_000 });
    expect(stateRate("MN")).toMatchObject({ top: 9.85, from: 337_930 });
    for (const c of ["TX", "FL", "NV", "WA", "WY", "SD", "TN", "AK", "NH"]) expect(stateRate(c).top).toBe(0);
  });
});

describe("every tax figure adds federal, the NIIT and state tax", () => {
  it("one year at 37% + 3.8% + 4.95% on the dividend, 20% + 3.8% + 4.95% on the gain", () => {
    const r = projectTax({ ...base, niit: true });
    expect(r.rows[0].taxNow).toBeCloseTo(1000 * 0.4575, 6);
    expect(r.taxOnSale).toBeCloseTo(4000 * 0.2875, 6);
    expect(combinedRates({ ...base, niit: true })).toMatchObject({ income: 45.75, gains: 28.75 });
  });
  it("the 199A deduction lowers the federal income rate only, not the NIIT or state", () => {
    expect(combinedRates({ ...base, niit: true, qrdDeduction: true }).income).toBeCloseTo(29.6 + 3.8 + 4.95, 6);
  });

  it("the calculator starts with the default state and the NIIT, and says which rates it used", () => {
    render(<Calculator />);
    const used = document.querySelector("[data-rates-used]")!.textContent!;
    expect(used).toContain("3.8% NIIT");
    expect(used).toContain(`${stateRate(STATES.default).top}% ${stateRate(STATES.default).name}`);
    // Picking a state switches the rate used.
    fireEvent.change(screen.getByLabelText("Client's state"), { target: { value: "CA" } });
    expect(document.querySelector("[data-rates-used]")!.textContent).toContain("13.3% California");
  });

  it("the worked example and BCRED's round numbers use the same state", () => {
    render(
      <>
        <WorkedExample />
        <FundTax fund="BCRED" />
      </>,
    );
    fireEvent.change(screen.getAllByLabelText("Client's state")[0], { target: { value: "NJ" } });
    expect(document.body.textContent).toContain("10.75% New Jersey");
    // BCRED: $9,200 a year taxed as income at 37% + 3.8% + 10.75% = 51.55%.
    expect(document.body.textContent).toContain(`$${Math.round(9200 * 0.5155).toLocaleString("en-US")}`);
    expect(document.body.textContent).not.toMatch(/Federal income tax only/);
  });
});
