import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import OutcomeLab from "@/components/addons/retirement-plus/OutcomeLab";
import { PAPER_DEFAULTS } from "@/lib/addons/retirement-plus/defaults";
import { premiumSensitivity, projectRetirement } from "@/lib/addons/retirement-plus/model";
import { signed, short } from "@/lib/addons/retirement-plus/format";

afterEach(cleanup);

function Harness() {
  const [p, setP] = useState(PAPER_DEFAULTS);
  return <OutcomeLab params={p} onChange={setP} />;
}

const cell = (k: string) => document.querySelector(`[data-lab="${k}"]`)!.textContent;
const field = (label: string) => screen.getByLabelText(label) as HTMLInputElement;
const type = (label: string, v: string) => {
  fireEvent.focus(field(label));
  fireEvent.change(field(label), { target: { value: v } });
  fireEvent.blur(field(label));
};

describe("Outcome Lab", () => {
  it("starts from the paper's worker, shows both badges and says it isn't the paper's model", () => {
    render(<Harness />);
    const r = projectRetirement(PAPER_DEFAULTS);
    expect(cell("public")).toBe(short(r.endPublicOnly));
    expect(cell("private")).toBe(short(r.endWithPrivate));
    expect(cell("difference")).toBe(signed(r.difference));
    expect(screen.getAllByText("Illustrative").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Hypothetical").length).toBeGreaterThan(0);
    expect(screen.getByText(/not the paper.s model/i)).toBeTruthy();
    expect(field("Starting salary").value).toBe("52,000");
    expect((screen.getByRole("button", { name: "Reset to paper's assumptions" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("the premium strip and the chart agree when all three premiums match a strip value", () => {
    render(<Harness />);
    for (const l of ["Equity", "Real assets", "Credit"]) type(l, "2");
    const two = document.querySelector('[data-premium="2"]')!;
    expect(two.getAttribute("aria-current")).toBe("true");
    expect(two.textContent).toContain(cell("difference")!);
    const expected = premiumSensitivity(PAPER_DEFAULTS).find((s) => s.premium === 2)!.difference;
    expect(cell("difference")).toBe(signed(expected));
  });

  it("fees push the 0% premium case below zero", () => {
    render(<Harness />);
    type("Extra fees, private", "1");
    expect(document.querySelector('[data-premium="0"]')!.textContent).toMatch(/^−\$/);
  });

  it("reset loads every default back", () => {
    render(<Harness />);
    type("Starting salary", "80000");
    type("Retirement age", "70");
    type("Public return a year", "6");
    expect(cell("public")).not.toBe(short(projectRetirement(PAPER_DEFAULTS).endPublicOnly));
    fireEvent.click(screen.getByRole("button", { name: "Reset to paper's assumptions" }));
    expect(field("Starting salary").value).toBe("52,000");
    expect(field("Retirement age").value).toBe("65");
    expect(cell("public")).toBe(short(projectRetirement(PAPER_DEFAULTS).endPublicOnly));
  });

  it("explains instead of charting when retirement comes before the start", () => {
    render(<Harness />);
    type("Starting age", "66");
    expect(screen.getByText("Retirement age needs to be after the starting age.")).toBeTruthy();
    expect(document.querySelector('[data-lab="public"]')).toBeNull();
  });
});
