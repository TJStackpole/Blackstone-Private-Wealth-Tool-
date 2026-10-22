import { describe, expect, it } from "vitest";
import { FUND_DATA, THEMES, findTheme, primarySector, themeWeight } from "@/lib/addons/themes/tags";
import type { FundCode } from "@/config/addons";

describe("theme tags", () => {
  it("only references sector names that exist in that fund's own data file", () => {
    for (const t of THEMES)
      for (const [fund, keys] of Object.entries(t.sectors))
        for (const k of keys!) expect(FUND_DATA[fund as FundCode].sectors.map((s) => s.key), `${t.id} → ${fund} ${k}`).toContain(k);
  });

  it("AI & data centers spans more than one fund, using the published weights", () => {
    const ai = findTheme("ai-data-centers")!;
    expect(themeWeight(ai, "BREIT")).toBe(27);
    expect(themeWeight(ai, "BXINFRA")).toBe(24.1);
    expect(themeWeight(ai, "BCRED")).toBe(0);
  });

  it("filters the map to the fund's largest tagged sector, or nothing if the theme isn't there", () => {
    const sw = findTheme("software-tech")!;
    expect(primarySector(sw, "BCRED")).toBe("Software");
    expect(primarySector(sw, "BXPE")).toBe("Technology & Services");
    expect(primarySector(sw, "BREIT")).toBeNull();
  });

  it("never tags more than 100% of a fund", () => {
    for (const f of Object.keys(FUND_DATA) as FundCode[]) {
      const tagged = new Set(THEMES.flatMap((t) => t.sectors[f] ?? []));
      const pct = FUND_DATA[f].sectors.filter((s) => tagged.has(s.key)).reduce((a, s) => a + s.pct, 0);
      expect(pct).toBeLessThanOrEqual(100);
    }
  });
});

describe("case for and against", () => {
  it("gives every theme the same number of sourced points on each side", async () => {
    const { BULL_BEAR } = await import("@/lib/addons/themes/tags");
    for (const t of THEMES) {
      const c = BULL_BEAR.themes[t.id];
      expect(c, t.id).toBeDefined();
      expect(c.for.length).toBe(c.against.length);
      expect(c.for.length).toBeGreaterThanOrEqual(2);
      for (const p of [...c.for, ...c.against]) expect(p.source.url).toMatch(/^https:\/\//);
    }
    expect(JSON.stringify(BULL_BEAR)).not.toMatch(/you should|we recommend/i);
  });

  it("lists a fund's themes largest first", async () => {
    const { topThemes } = await import("@/lib/addons/themes/tags");
    const t = topThemes("BREIT").map((x) => x.theme.id);
    expect(t).toEqual(["housing", "ai-data-centers", "logistics"]);
  });
});
