import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import DetailPanel from "@/components/DetailPanel";
import { LAYERS } from "@/data/layers";

afterEach(cleanup);
const bcred = LAYERS.find((l) => l.id === "bcred")!;

function panel(sector: string | null, onSector = vi.fn()) {
  render(<DetailPanel layer={bcred} data={bcred.data!} sector={sector} selected={null} onSelect={() => {}} onSector={onSector} geoItems={bcred.data!.geography.items} />);
  return { group: screen.getByRole("group", { name: "Filter by sector" }), onSector };
}

describe("the panel's Sector mix is the sector filter", () => {
  it("lists every sector as a button with its share, except the 'All other' remainder", () => {
    const { group } = panel(null);
    expect(within(group).getByRole("button", { name: "All sectors" }).getAttribute("aria-pressed")).toBe("true");
    expect(within(group).getByRole("button", { name: "Software 25.8%" })).toBeTruthy();
    expect(within(group).queryByRole("button", { name: /^All other/ })).toBeNull();
    expect(within(group).getByText("All other industries")).toBeTruthy();
  });
  it("picks a sector, and picking it again or All sectors clears it", () => {
    const { group, onSector } = panel("Insurance");
    const ins = within(group).getByRole("button", { name: /^Insurance/ });
    expect(ins.getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(within(group).getByRole("button", { name: /^Software/ }));
    expect(onSector).toHaveBeenLastCalledWith("Software");
    fireEvent.click(ins);
    expect(onSector).toHaveBeenLastCalledWith(null);
    fireEvent.click(within(group).getByRole("button", { name: "All sectors" }));
    expect(onSector).toHaveBeenLastCalledWith(null);
  });
});
