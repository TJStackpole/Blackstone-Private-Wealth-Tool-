import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import FundPrint from "@/components/FundPrint";
import DetailPanel from "@/components/DetailPanel";
import { LAYERS } from "@/data/layers";
import { FUND_CODE } from "@/lib/addons/shared/funds";
import { formatPct } from "@/lib/aggregate";
import { latestFor } from "@/lib/latest";
import { quarterFigures } from "@/lib/quarter";
import { termsFor } from "@/lib/addons/liquidity/data";

afterEach(cleanup);

const funds = LAYERS.filter((l) => FUND_CODE[l.id] && l.data);

describe("fund one-pager (print)", () => {
  it("has a Print / Save as PDF button by the fund's title", () => {
    const l = funds[0];
    render(<DetailPanel layer={l} data={l.data!} sector={null} selected={null} onSelect={() => {}} geoItems={l.data!.geography.items} />);
    expect(screen.getByRole("button", { name: "Print / Save as PDF" })).toBeTruthy();
  });

  for (const l of funds) {
    it(`${l.fund}: title, the latest month, the last quarter, getting money out, the full sector mix, sources and the disclaimer`, () => {
      const d = l.data!;
      const latest = latestFor(l.id)!;
      const fund = FUND_CODE[l.id]!;
      render(<FundPrint data={d} latest={latest} fund={fund} />);
      const page = document.querySelector(`[data-fund-print="${d.fund}"]`)!;
      const text = page.textContent!;
      expect(page.querySelector("h1")!.textContent).toBe(`${d.fund} · ${d.assetClass}`);
      expect(text).toContain("Latest monthly update");
      expect(text).toContain("Last quarterly report");
      for (const m of latest.items) expect(text).toContain(m.value);
      for (const m of quarterFigures(d, latest)!.items) expect(text).toContain(m.value);
      // Each figure once: no separate block of stat cards repeating the quarter's numbers.
      expect(text).not.toContain("Key numbers");
      const terms = termsFor(fund)!;
      expect(page.querySelector("[data-print-liquidity]")!.textContent).toContain(`bought back at ${100 - terms.earlyDeduction.value}% of NAV`);
      // Every source the printed figures use is listed, the month-end filing's notes included.
      for (const s of [...latest.items, ...latest.notes].flatMap((x) => x.sources)) expect(text).toContain(s.url);
      for (const s of d.sectors) expect(text).toContain(`${s.label}${formatPct(s.pct)}`);
      expect(text).toContain(d.filing.url);
      expect(text).toContain("Next update expected: November 2026");
      expect(text).toContain("Not affiliated with or endorsed by Blackstone");
      // Print-only: nothing extra on screen.
      expect(page.closest(".print-onepager")!.className).toContain("hidden");
    });
  }
});
