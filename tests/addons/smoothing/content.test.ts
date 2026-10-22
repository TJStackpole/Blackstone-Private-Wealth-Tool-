import { describe, expect, it } from "vitest";
import { CONTENT } from "@/lib/addons/smoothing/data";

describe("smoothing content", () => {
  it("has the plan's three sections, a 30-second script and three objections", () => {
    expect(CONTENT.sections.map((s) => s.id)).toEqual(["appraised", "meaning", "honest"]);
    expect(CONTENT.script.length).toBeGreaterThanOrEqual(3);
    expect(CONTENT.objections).toHaveLength(3);
  });
  it("cites a source for every paragraph that names a fund or a method", () => {
    for (const s of CONTENT.sections)
      for (const p of s.paragraphs)
        if (/BREIT|BCRED|BXPE|BX Infra|Geltner|appraiser/.test(p.text)) expect(p.source, p.text.slice(0, 50)).not.toBeNull();
  });
  it("never uses advice wording", () => {
    const all = JSON.stringify(CONTENT);
    expect(all).not.toMatch(/you should|we recommend/i);
  });
});
