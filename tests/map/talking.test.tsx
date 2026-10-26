import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import FundActions from "@/components/FundActions";
import { LAYERS } from "@/data/layers";
import { talkingPoints } from "@/lib/talkingPoints";
import type { FundData, LayerId } from "@/lib/types";
import { LATEST } from "@/lib/latest";

afterEach(cleanup);

const funds = LAYERS.filter((l) => l.id !== "retirement" && l.data);

/** Everything the site shows for a fund, as text: its data file, its newest monthly figures and table cells, and its sector and region shares written as "42%". */
function facts(d: FundData, id: LayerId): string {
  const shares = [...d.sectors, ...d.geography.items].map((s) => `${s.pct}%`);
  return [JSON.stringify(d), JSON.stringify(LATEST.funds[id] ?? {}), JSON.stringify(LATEST.compare), shares.join(" ")].join(" ");
}

/** Figures in a sentence, leaving out dates ("December 31, 2025", "June 30"). */
function figures(s: string): string[] {
  const noDates = s.replace(/(January|February|March|April|May|June|July|August|September|October|November|December) \d{1,2}(, \d{4})?/g, "");
  return noDates.match(/\$?\d[\d,]*(\.\d+)?(%|B)?/g) ?? [];
}

describe("talking points", () => {
  for (const l of funds) {
    it(`${l.fund}: three neutral sentences, and every figure in them is one the site shows from the filing`, () => {
      const tp = talkingPoints(l.id)!;
      expect(tp).toBeTruthy();
      const text = facts(l.data!, l.id);
      for (const s of [tp.does, tp.risk, tp.changed]) {
        expect(s.trim().endsWith(".")).toBe(true);
        expect(s).not.toMatch(/\byou\b|should|recommend|guarantee|\bsafe\b/i);
        for (const f of figures(s)) expect(text, `${l.fund}: "${f}" in "${s}"`).toContain(f.replace(/^\$/, "").replace(/B$/, ""));
      }
    });
  }

  it("opens from the button and copies the sentences with the source and disclaimer", async () => {
    const l = funds.find((f) => f.id === "bcred")!;
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    render(<FundActions layerId={l.id} data={l.data!} />);
    expect(screen.queryByRole("region", { name: /Talking points/ })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Talking points" }));
    const tp = talkingPoints(l.id)!;
    expect(screen.getByRole("region", { name: /Talking points/ }).textContent).toContain(tp.risk);
    fireEvent.click(screen.getByRole("button", { name: "Copy" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Copied" })).toBeTruthy());
    const copied = writeText.mock.calls[0][0] as string;
    for (const s of [tp.does, tp.risk, tp.changed, l.data!.filing.url, "Not investment advice"]) expect(copied).toContain(s);
  });
});
