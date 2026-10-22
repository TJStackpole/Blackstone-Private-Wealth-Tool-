import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import DetailPanel from "@/components/DetailPanel";
import { LAYERS } from "@/data/layers";

afterEach(cleanup);

const bcred = LAYERS.find((l) => l.id === "bcred")!;
const q = bcred.data!.quarterSummary!;

describe("BCRED: This quarter box", () => {
  it("shows four moves under the title, each with a direction, its comparison and the filing", () => {
    render(<DetailPanel layer={bcred} data={bcred.data!} sector={null} selected={null} onSelect={() => {}} geoItems={bcred.data!.geography.items} />);
    const box = screen.getByRole("region", { name: "This quarter" });
    expect(q.items.map((m) => m.label)).toEqual(["Net assets", "NAV per share", "Bought back, pro rata", "Non-accrual issuers"]);
    for (const m of q.items) {
      const cell = box.querySelector(`[data-quarter="${m.label}"]`) as HTMLElement;
      expect(within(cell).getByText(m.value)).toBeTruthy();
      expect(cell.textContent).toContain(m.change);
      expect(cell.textContent).toContain(m.direction === "up" ? "Up:" : "Down:");
    }
    expect(within(box).getByRole("link").getAttribute("href")).toBe(bcred.data!.source.url);
    // The older bullet list would repeat the same facts, so it's hidden when the box is shown.
    expect(screen.queryByText("This quarter, per the filing")).toBeNull();
  });

  it("directions agree with the numbers in the filing data", () => {
    const stat = (label: string) => bcred.data!.summary.stats.find((s) => s.label === label)!.value;
    expect(q.items[0].value).toBe(stat("Net assets"));
    expect(q.items[1].value).toBe(stat("NAV per share"));
    expect(q.items[0]).toMatchObject({ direction: "down", change: "−10.1%" });
    expect(q.items[1]).toMatchObject({ direction: "down", change: "−4.6%" });
    expect(q.items[2]).toMatchObject({ value: "5.0%", direction: "down", change: "−2.0 pts" });
    expect(q.items[3]).toMatchObject({ value: "15", direction: "up", change: "+6" });
  });
});
