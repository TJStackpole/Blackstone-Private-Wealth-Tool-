import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { REGULATORY, ROOM } from "@/lib/addons/retirement-plus/data";
import { driftAfterWithdrawals } from "@/lib/addons/retirement-plus/liquidity";
import Timeline from "@/components/addons/retirement-plus/Timeline";

afterEach(() => {
  cleanup();
  vi.resetModules();
  vi.doUnmock("@/config/addons");
});

/** Renders the 401(k) tab with some add-ons switched off. */
async function renderRoom(off: string[] = []) {
  vi.doMock("@/config/addons", async (orig) => {
    const real = await orig<typeof import("@/config/addons")>();
    const list = real.ADDONS.map((a) => (off.includes(a.id) ? { ...a, enabled: false } : a));
    return { ...real, ADDONS: list, findAddon: (id: string) => list.find((a) => a.id === id && a.enabled) };
  });
  const { default: RetirementPlus } = await import("@/components/addons/retirement-plus/RetirementPlus");
  render(<RetirementPlus onOpenLayer={() => {}} />);
}

const order = () => [...document.querySelectorAll("[data-section]")].map((e) => e.getAttribute("data-section"));
const labNumbers = () => [...document.querySelectorAll("[data-lab]")].map((e) => `${e.getAttribute("data-lab")}=${e.textContent}`);
const concerns = () => [...document.querySelectorAll("[data-concern]")].map((e) => e.getAttribute("data-concern"));

describe("liquidity drift", () => {
  it("pays withdrawals from the public part, so the private share drifts up", () => {
    expect(driftAfterWithdrawals(20, 0).privateShareAfter).toBe(20);
    const d = driftAfterWithdrawals(20, 10);
    expect(d.paidInFull).toBe(true);
    expect(d.privateShareAfter).toBeCloseTo(22.22, 2);
    const e = driftAfterWithdrawals(90, 20);
    expect(e.paidInFull).toBe(false);
    expect(e.paidPct).toBe(50);
  });
});

describe("audiences", () => {
  it("switching Worker / Employer changes wording and order only; the Lab's numbers stay identical", async () => {
    await renderRoom();
    const worker = { order: order(), lab: labNumbers(), concerns: concerns() };
    expect(screen.getAllByText(ROOM.audiences.worker.title).length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("button", { name: "Employer" }));
    expect(screen.getAllByText(ROOM.audiences.employer.title).length).toBeGreaterThan(0);
    expect(screen.queryByText(ROOM.audiences.worker.title)).toBeNull();
    expect(screen.getAllByRole("heading", { name: ROOM.audiences.employer.concernsTitle }).length).toBeGreaterThan(0);
    expect(order()).not.toEqual(worker.order);
    expect([...order()].sort()).toEqual([...worker.order].sort());
    expect(concerns()[0]).toBe("lawsuits");
    expect([...concerns()].sort()).toEqual([...worker.concerns].sort());
    expect(labNumbers()).toEqual(worker.lab);
    expect(labNumbers().length).toBeGreaterThan(0);
  });
});

describe("cross-links", () => {
  it("show when the Liquidity and Smoothing tools are on", async () => {
    await renderRoom();
    expect(screen.getByRole("link", { name: /See how redemption limits work/ }).getAttribute("href")).toBe("/toolkit/liquidity");
    expect(screen.getByRole("link", { name: /Why are the values so smooth/ }).getAttribute("href")).toBe("/toolkit/smoothing");
  });
  it("hide themselves when those tools are off, leaving no broken links", async () => {
    await renderRoom(["liquidity", "smoothing"]);
    expect(screen.queryByRole("link", { name: /redemption limits/ })).toBeNull();
    expect(screen.queryByRole("link", { name: /so smooth/ })).toBeNull();
    for (const a of document.querySelectorAll("a[href^='/toolkit/']")) expect(a.getAttribute("href")).not.toMatch(/liquidity|smoothing/);
  });
});

describe("sources", () => {
  it("every concern has a source on both sides, and every timeline entry has one", () => {
    for (const o of ROOM.objections) {
      expect(o.concern.sources.length).toBeGreaterThan(0);
      expect(o.response.sources.length).toBeGreaterThan(0);
      for (const s of [...o.concern.sources, ...o.response.sources]) expect(s.url).toMatch(/^https:\/\//);
    }
    for (const e of REGULATORY.entries) expect(e.source.url).toMatch(/^https:\/\//);
  });
  it("the fees card lists each fund's own fees, each linked to that fund's filing", async () => {
    await renderRoom();
    const rows = [...document.querySelectorAll("[data-fee]")];
    expect(rows.map((r) => r.getAttribute("data-fee"))).toEqual(["BREIT", "BXINFRA", "BXPE", "BCRED"]);
    const ciks = { BREIT: "1662972", BXINFRA: "2030772", BXPE: "1930054", BCRED: "1803498" } as Record<string, string>;
    for (const r of rows) {
      expect(r.textContent).toMatch(/1\.25% a year/);
      expect(r.querySelector("a")!.getAttribute("href")).toContain(`/data/${ciks[r.getAttribute("data-fee")!]}/`);
    }
    expect(document.querySelector('[data-concern="fees"]')!.textContent).not.toMatch(/Retail versions/);
  });
  it("an empty timeline shows a placeholder, not an error", () => {
    render(<Timeline entries={[]} checked="2026-10-22" />);
    expect(screen.getByRole("status").textContent).toMatch(/only from sourced documents/);
  });
});
