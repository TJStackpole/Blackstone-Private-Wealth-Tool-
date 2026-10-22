import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import DetailPanel from "@/components/DetailPanel";
import { LAYERS } from "@/data/layers";

afterEach(cleanup);

const funds = LAYERS.filter((l) => l.data?.quarterSummary);
const bcred = LAYERS.find((l) => l.id === "bcred")!;
const q = bcred.data!.quarterSummary!;
const signOf = (change: string) => (change.startsWith("+") ? "up" : change.startsWith("−") ? "down" : null);

describe("This quarter box", () => {
  it("every fund has one", () => {
    expect(funds.map((l) => l.fund)).toEqual(["BREIT", "BX Infra", "BXPE", "BCRED"]);
  });

  for (const l of funds) {
    it(`${l.fund}: each move has a direction that matches its sign, a comparison, and the filing`, () => {
      const d = l.data!;
      render(<DetailPanel layer={l} data={d} sector={null} selected={null} onSelect={() => {}} geoItems={d.geography.items} />);
      const box = screen.getByRole("region", { name: "This quarter" });
      const items = d.quarterSummary!.items;
      expect(items.length).toBeGreaterThanOrEqual(4);
      expect(items.length).toBeLessThanOrEqual(5);
      for (const m of items) {
        const cell = box.querySelector(`[data-quarter="${m.label}"]`) as HTMLElement;
        expect(within(cell).getByText(m.value)).toBeTruthy();
        expect(cell.textContent).toContain(m.change);
        expect(cell.textContent).toContain(m.from);
        const sign = signOf(m.change);
        if (sign) expect(m.direction).toBe(sign);
        expect(cell.textContent).toContain(m.direction === "up" ? "Up:" : m.direction === "down" ? "Down:" : "Unchanged:");
      }
      expect(within(box).getAllByRole("link")[0].getAttribute("href")).toBe(d.source.url);
      expect(box.textContent).toContain("Next update expected");
    });
  }

  it("BCRED: the five moves the plan asks for, from the 10-Q", () => {
    expect(q.items.map((m) => m.label)).toEqual(["Net assets", "NAV per share", "Bought back, pro rata", "Non-accrual issuers", "Income vs. payout"]);
    expect(q.items[0]).toMatchObject({ value: "$42.8B", direction: "down", change: `−${((1 - 42_775_600 / 47_612_086) * 100).toFixed(1)}%` });
    expect(q.items[1]).toMatchObject({ value: "$23.65", direction: "down", change: "−4.6%" });
    expect(q.items[2]).toMatchObject({ value: "5.0%", direction: "down", change: "−2.0 pts" });
    expect(q.items[3]).toMatchObject({ value: "15", direction: "up", change: "+6" });
    expect(q.items[4]).toMatchObject({ value: "$1.07 / $1.20", direction: "down", change: "−$0.13" });
  });
});

describe("Stat cards", () => {
  for (const l of funds) {
    it(`${l.fund}: size, NAV with its share class, distribution rate, each with its change and sources`, () => {
      const stats = l.data!.summary.stats;
      expect(stats).toHaveLength(4);
      expect(stats[0].label).toMatch(/^Net asset/);
      expect(stats[1].label).toMatch(/^NAV per (share|unit) \(Class I\)$/);
      expect(stats[2].label).toBe("Distribution rate");
      for (const s of stats) {
        expect(s.change && s.direction && s.from).toBeTruthy();
        expect(s.sources?.length).toBeGreaterThan(0);
        for (const src of s.sources!) expect(src.url).toMatch(/^https:\/\/www\.sec\.gov\//);
        const sign = signOf(s.change!);
        if (sign) expect(s.direction).toBe(sign);
      }
    });
  }

  it("BCRED's distribution rate is June's Class I distribution annualized on the June 30 NAV, and notes July's lower declaration", () => {
    const d = bcred.data!.summary.stats[2];
    expect(d.value).toBe(`${((0.2 * 12) / 23.65 * 100).toFixed(1)}%`);
    expect(d.note).toContain("Jun 30, 2026");
    expect(d.note).toContain("July's declared $0.18 is 9.1%");
    expect(d).toMatchObject({ change: "−$0.02", direction: "down" });
  });

  it("BXPE says it pays none rather than leaving the card out", () => {
    const d = LAYERS.find((l) => l.id === "bxpe")!.data!.summary.stats[2];
    expect(d).toMatchObject({ value: "None", note: "BXPE does not currently intend to declare distributions." });
  });

  it("All funds shows each fund's size", async () => {
    const { default: AllFundsView } = await import("@/components/AllFundsView");
    render(<AllFundsView layers={LAYERS} onOpenLayer={() => {}} />);
    for (const v of ["$56.6B", "$5.2B", "$14.2B", "$42.8B"]) expect(screen.getAllByText(v).length).toBeGreaterThan(0);
  });
});
