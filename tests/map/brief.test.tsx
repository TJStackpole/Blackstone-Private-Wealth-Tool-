import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import FundBrief from "@/components/FundBrief";
import { LAYERS } from "@/data/layers";
import { briefText, fundBrief } from "@/lib/fundBrief";
import { LATEST } from "@/lib/latest";
import { COMPARE } from "@/lib/compare";
import type { FundData, LayerId } from "@/lib/types";
import liquidity from "@/data/addons/liquidity/terms.json";

afterEach(cleanup);

const funds = LAYERS.filter((l) => l.id !== "retirement" && l.data);

/** Everything the site shows for a fund, as text, so every figure in an answer can be traced to it. */
function facts(d: FundData, id: LayerId): string {
  const shares = [...d.sectors, ...d.geography.items].map((s) => `${s.pct}%`);
  return [JSON.stringify(d), JSON.stringify(LATEST.funds[id] ?? {}), JSON.stringify(LATEST.compare), JSON.stringify(COMPARE), JSON.stringify(liquidity), shares.join(" ")].join(" ");
}

function figures(s: string): string[] {
  const noDates = s.replace(/(January|February|March|April|May|June|July|August|September|October|November|December) \d{1,2}(, \d{4})?/g, "");
  return (noDates.match(/\$?\d[\d,]*(\.\d+)?(%|B)?/g) ?? []).filter((f) => !/^Q?\d$/.test(f) && !/^20\d\d$/.test(f));
}

describe("a fund in five answers", () => {
  for (const l of funds) {
    it(`${l.fund}: five questions, each dated and sourced, every figure one the site shows`, () => {
      const a = fundBrief(l.id, l.data!);
      expect(a.map((x) => x.id)).toEqual(["what", "pays", "out", "changed", "risk"]);
      const text = facts(l.data!, l.id);
      for (const x of a) {
        expect(x.lines.length).toBeGreaterThan(0);
        expect(x.sources.length, `${l.fund} ${x.id}`).toBeGreaterThan(0);
        expect(x.asOf).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        for (const line of x.lines) {
          expect(line.trim()).toMatch(/[.)]$/);
          expect(line).not.toMatch(/\byou\b|should|recommend|guarantee|\bsafe\b/i);
          for (const f of figures(line)) expect(text, `${l.fund} ${x.id}: "${f}" in "${line}"`).toContain(f.replace(/^\$/, "").replace(/B$/, ""));
        }
      }
    });
  }

  it("states each fund's payout and buyback terms from the filings, in plain words", () => {
    const breit = fundBrief("breit", LAYERS[0].data!);
    expect(breit.find((x) => x.id === "pays")!.lines[0]).toBe(`${LATEST.compare.distribution.cells.BREIT!.value} a year at the latest payout rate.`);
    const out = breit.find((x) => x.id === "out")!.lines;
    expect(out).toContain("Buyback limit: 2% a month and 5% a quarter, of NAV.");
    expect(out).toContain("Early-sale deduction: 2% if held less than 1 year (bought back at 98% of NAV).");
    const bxpe = LAYERS.find((x) => x.id === "bxpe")!;
    expect(fundBrief("bxpe", bxpe.data!).find((x) => x.id === "pays")!.lines).toEqual(["Nothing for now.", "BXPE does not currently intend to declare distributions."]);
  });

  it("shows the answers, keeps the details closed until asked, and copies the answers with every source", async () => {
    const l = funds.find((f) => f.id === "bcred")!;
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    const onDetails = vi.fn();
    render(<FundBrief layer={l} data={l.data!} details={false} onDetails={onDetails} detailsId="d" />);
    const answers = fundBrief(l.id, l.data!);
    const section = screen.getByRole("region", { name: "BCRED, in five answers" });
    for (const a of answers) expect(within(section).getByRole("heading", { name: a.question })).toBeTruthy();
    const toggle = screen.getByRole("button", { name: /See the details/ });
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(toggle);
    expect(onDetails).toHaveBeenCalledWith(true);
    fireEvent.click(screen.getByRole("button", { name: "Copy these answers" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Copied" })).toBeTruthy());
    const copied = writeText.mock.calls[0][0] as string;
    expect(copied).toBe(briefText("BCRED", answers));
    for (const a of answers) for (const s of a.sources) expect(copied).toContain(s.url);
    expect(copied).toContain("Not investment advice");
  });
});
