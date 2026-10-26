import { describe, expect, it } from "vitest";
import { ask, EXAMPLES } from "@/lib/questions";
import { COMPARE_ROWS } from "@/lib/compare";

describe("Ask a question", () => {
  it("answers every example, each answer dated and sourced", () => {
    for (const q of EXAMPLES) {
      const r = ask(q);
      expect(r.topic, q).not.toBeNull();
      if (r.topic === "define") expect(r.term).toBeTruthy();
      else for (const a of r.answers) {
        expect(a.lines.length, q).toBeGreaterThan(0);
        expect(a.sources.length, q).toBeGreaterThan(0);
        expect(a.asOf, q).toBeTruthy();
      }
    }
  });

  it("reads which fund and which question", () => {
    expect(ask("Can my client get money out of BCRED?")).toMatchObject({ topic: "out", answers: [{ fund: "BCRED" }] });
    expect(ask("How are the payouts taxed?").topic).toBe("tax");
    expect(ask("What does BREIT pay?")).toMatchObject({ topic: "pays", answers: [{ fund: "BREIT" }] });
    expect(ask("redemptions for infrastructure and private equity").answers.map((a) => a.fund)).toEqual(["BXINFRA", "BXPE"]);
    expect(ask("What are the fees?").answers).toHaveLength(4);
    expect(ask("What is a REIT?")).toMatchObject({ topic: "define", term: { id: "reit" } });
    expect(ask("what does nav mean")).toMatchObject({ topic: "define", term: { id: "nav" } });
    expect(ask("What is BREIT?")).toMatchObject({ topic: "what", answers: [{ fund: "BREIT" }] });
  });

  it("gives the minimum investment as Not in filing, with where it would come from", () => {
    const r = ask("What's the minimum investment for BREIT?");
    expect(r.topic).toBe("minimum");
    const cell = COMPARE_ROWS.find((x) => x.id === "minimum")!.cells.BREIT;
    expect(r.answers[0].lines[0]).toBe(`Minimum investment: Not in filing. It would come from ${cell.where}.`);
  });

  it("says so when it can't match, rather than guessing", () => {
    expect(ask("Who won the game last night?")).toMatchObject({ topic: null, answers: [] });
  });
});
