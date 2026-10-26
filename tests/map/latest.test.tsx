import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import LatestBox from "@/components/LatestBox";
import { LATEST, latestFor } from "@/lib/latest";
import { LAYERS } from "@/data/layers";

afterEach(cleanup);

const funds = LAYERS.filter((l) => l.data?.quarterSummary);
const signOf = (change: string) => (change.startsWith("+") ? "up" : change.startsWith("−") ? "down" : null);

describe("Latest monthly update", () => {
  it("every fund has month-end figures newer than its 10-Q", () => {
    for (const l of funds) {
      const m = latestFor(l.id)!;
      expect(m, l.fund).toBeTruthy();
      expect(m.asOf > l.data!.asOf).toBe(true);
      expect(m.filed > m.asOf).toBe(true);
      expect(m.asOf).toBe(LATEST.asOf);
    }
  });

  for (const l of funds) {
    it(`${l.fund}: each figure is sourced to sec.gov, and any change has the direction its sign says`, () => {
      const m = latestFor(l.id)!;
      for (const i of m.items) {
        expect(i.value).toBeTruthy();
        expect(i.sources.length).toBeGreaterThan(0);
        for (const s of i.sources) expect(s.url).toMatch(/^https:\/\/www\.sec\.gov\//);
        if (i.change) expect(signOf(i.change) ?? "flat").toBe(i.direction);
      }
      for (const n of m.notes) for (const s of n.sources) expect(s.url).toMatch(/^https:\/\/www\.sec\.gov\//);
    });

    it(`${l.fund}: the box shows both dates and keeps the 10-Q's date for the map`, () => {
      const m = latestFor(l.id)!;
      render(<LatestBox latest={m} quarterAsOf={l.data!.asOf} />);
      const box = screen.getByRole("region", { name: "Latest monthly update" });
      expect(box.textContent).toContain("Values at Sep 30, 2026");
      expect(box.textContent).toContain("filed Oct 22, 2026");
      expect(box.textContent).toContain("Map and sectors: the 10-Q, Jun 30, 2026");
      expect(box.textContent).toContain("Next update expected");
      for (const i of m.items) expect(within(box.querySelector(`[data-latest="${i.label}"]`) as HTMLElement).getByText(i.value)).toBeTruthy();
      for (const a of within(box).getAllByRole("link")) expect(a.getAttribute("href")).toMatch(/^https:\/\/www\.sec\.gov\//);
    });
  }

  it("NAV per share moves match the June 30 figure the 10-Q gives", () => {
    for (const l of funds) {
      const nav = latestFor(l.id)!.items.find((i) => /^NAV per/.test(i.label))!;
      const june = l.data!.summary.stats[1].value;
      expect(nav.from).toContain(`from ${june} on Jun 30, 2026`);
      const pct = ((Number(nav.value.slice(1)) / Number(june.slice(1)) - 1) * 100).toFixed(1);
      expect(nav.change).toBe(`${Number(pct) > 0 ? "+" : "−"}${Math.abs(Number(pct)).toFixed(1)}%`);
    }
  });

  it("no advice wording", () => {
    const text = JSON.stringify(LATEST);
    expect(text).not.toMatch(/you should|we recommend|consider buying/i);
  });
});
