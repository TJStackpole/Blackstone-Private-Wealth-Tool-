import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import HoldingsLead, { holdingsLead } from "@/components/HoldingsLead";
import DetailPanel from "@/components/DetailPanel";
import { LAYERS } from "@/data/layers";

afterEach(cleanup);
const layer = (id: string) => LAYERS.find((l) => l.id === id)!;
const bcred = layer("bcred");

describe("credit funds lead with their borrowers", () => {
  it("applies to BCRED only", () => {
    expect(LAYERS.filter((l) => l.data && holdingsLead(l.data)).map((l) => l.id)).toEqual(["bcred"]);
  });

  it("ranks all twelve borrowers with their share of net assets and the total", () => {
    render(<HoldingsLead data={bcred.data!} sector={null} />);
    expect(screen.getByRole("heading", { level: 2, name: "Largest borrowers" })).toBeTruthy();
    const items = bcred.data!.topHoldings!.items;
    expect(screen.getAllByRole("listitem")).toHaveLength(items.length);
    const total = items.reduce((t, h) => t + h.pctOfNetAssets, 0);
    expect(screen.getByText(/^Top 12/).textContent).toContain(`${total.toFixed(1)}%`);
  });

  it("follows the sector chips, and says so when a sector has none of the largest borrowers", () => {
    const { rerender } = render(<HoldingsLead data={bcred.data!} sector="Insurance" />);
    expect(screen.getByRole("heading", { name: "Largest Insurance borrowers" })).toBeTruthy();
    expect(screen.queryByText("Dropbox, Inc.")).toBeNull();
    rerender(<HoldingsLead data={bcred.data!} sector="Financial Services" />);
    expect(screen.getByText(/None of the 12 largest borrowers/)).toBeTruthy();
  });

  it("the side panel stops repeating the list", () => {
    render(<DetailPanel layer={bcred} data={bcred.data!} sector={null} selected={null} onSelect={() => {}} geoItems={bcred.data!.geography.items} />);
    expect(screen.queryByText("Dropbox, Inc.")).toBeNull();
  });
});
