import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { LAYERS, RETIREMENT } from "@/data/layers";

afterEach(() => {
  cleanup();
  vi.resetModules();
  vi.doUnmock("@/config/addons");
});

async function renderTab(enabled: boolean) {
  vi.doMock("@/config/addons", async (orig) => {
    const real = await orig<typeof import("@/config/addons")>();
    const list = real.ADDONS.map((a) => (a.id === "retirement-plus" ? { ...a, enabled } : a));
    return { ...real, ADDONS: list, findAddon: (id: string) => list.find((a) => a.id === id && a.enabled) };
  });
  const { default: RetirementView } = await import("@/components/RetirementView");
  render(<RetirementView data={RETIREMENT} layers={LAYERS} onOpenLayer={() => {}} />);
}

describe("401(k) tab slot (Rule B)", () => {
  it("with the add-on off, the tab is the original Retirement lens", async () => {
    await renderTab(false);
    expect(screen.getByText("A small slice of private markets inside an ordinary 401(k)")).toBeTruthy();
    expect(screen.queryByText("The 0.1% problem")).toBeNull();
  });
  it("with the add-on on, the upgraded tab renders in the same tab panel", async () => {
    await renderTab(true);
    expect(screen.getByRole("heading", { name: "The 0.1% problem" })).toBeTruthy();
    expect(screen.getByRole("tabpanel").id).toBe("panel-retirement");
  });
});
