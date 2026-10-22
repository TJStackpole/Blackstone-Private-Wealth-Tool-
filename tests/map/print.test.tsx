import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import FundPrint from "@/components/FundPrint";
import DetailPanel from "@/components/DetailPanel";
import { LAYERS } from "@/data/layers";
import { FUND_CODE } from "@/lib/addons/shared/funds";
import { formatPct } from "@/lib/aggregate";

afterEach(cleanup);

const funds = LAYERS.filter((l) => FUND_CODE[l.id] && l.data);

describe("fund one-pager (print)", () => {
  it("has a Print / Save as PDF button by the fund's title", () => {
    const l = funds[0];
    render(<DetailPanel layer={l} data={l.data!} sector={null} selected={null} onSelect={() => {}} geoItems={l.data!.geography.items} />);
    expect(screen.getByRole("button", { name: "Print / Save as PDF" })).toBeTruthy();
  });

  for (const l of funds) {
    it(`${l.fund}: title, this quarter, every stat card, the full sector mix, sources and the disclaimer`, () => {
      const d = l.data!;
      render(<FundPrint data={d} />);
      const page = document.querySelector(`[data-fund-print="${d.fund}"]`)!;
      const text = page.textContent!;
      expect(page.querySelector("h1")!.textContent).toBe(`${d.fund} · ${d.assetClass}`);
      expect(text).toContain("This quarter");
      for (const s of d.summary.stats) expect(text).toContain(s.value);
      for (const s of d.sectors) expect(text).toContain(`${s.label}${formatPct(s.pct)}`);
      expect(text).toContain(d.filing.url);
      expect(text).toContain("Next update expected: November 2026");
      expect(text).toContain("Not affiliated with or endorsed by Blackstone");
      // Print-only: nothing extra on screen.
      expect(page.closest(".print-onepager")!.className).toContain("hidden");
    });
  }
});
