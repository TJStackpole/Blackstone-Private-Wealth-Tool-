import { describe, expect, it } from "vitest";
import { GLIDE, MODEL } from "@/lib/addons/retirement-plus/data";
import { PAPER_DEFAULTS } from "@/lib/addons/retirement-plus/defaults";
import { contributionRate, mixAt, premiumSensitivity, projectRetirement, salaryAt, type LabParams } from "@/lib/addons/retirement-plus/model";

const base: LabParams = PAPER_DEFAULTS;

describe("published glidepath", () => {
  it("totals 20% at every listed age, and the age-25 and age-65 rows match the plan", () => {
    for (const r of GLIDE.rows) expect(r.privateEquity + r.privateRealAssets + r.privateCredit).toBeCloseTo(20, 1);
    expect(mixAt(25, GLIDE.rows)).toMatchObject({ privateEquity: 15, privateRealAssets: 4, privateCredit: 1 });
    expect(mixAt(65, GLIDE.rows)).toMatchObject({ privateEquity: 5, privateRealAssets: 9.7, privateCredit: 5.3 });
  });
  it("moves in a straight line between listed ages, still totalling 20%, and holds the end rows outside them", () => {
    const mid = mixAt(45, GLIDE.rows);
    expect(mid.privateEquity).toBeCloseTo(10, 9);
    expect(mid.total).toBeCloseTo(20, 9);
    expect(mixAt(21, GLIDE.rows).privateEquity).toBe(15);
    expect(mixAt(80, GLIDE.rows).privateCredit).toBe(5.3);
  });
});

describe("projectRetirement", () => {
  it("contribution ramp hits 8.8% at 25 and 12% at 65 exactly", () => {
    expect(contributionRate(25, base)).toBe(8.8);
    expect(contributionRate(65, base)).toBe(12);
  });
  it("salary at 26 is $52,000 × 1.045", () => {
    expect(salaryAt(26, base)).toBeCloseTo(52_000 * 1.045, 9);
  });
  it("a 0% premium with no extra fees gives identical paths", () => {
    const r = projectRetirement({ ...base, premiumPct: { privateEquity: 0, privateRealAssets: 0, privateCredit: 0 } });
    r.years.forEach((y) => expect(y.withPrivate).toBeCloseTo(y.publicOnly, 6));
  });
  it("a 0% private slice gives identical paths", () => {
    const r = projectRetirement({ ...base, privatePct: 0 });
    r.years.forEach((y) => expect(y.withPrivate).toBeCloseTo(y.publicOnly, 6));
  });
  it("income equals ending balance × withdrawal rate", () => {
    const r = projectRetirement(base);
    expect(r.incomePublicOnly).toBeCloseTo(r.endPublicOnly * 0.04, 6);
    expect(r.incomeWithPrivate).toBeCloseTo(r.endWithPrivate * 0.04, 6);
  });
  it("raising fees always lowers the private-slice ending balance", () => {
    const ends = [0, 0.5, 1, 2, 3].map((f) => projectRetirement({ ...base, privateFeePct: f }).endWithPrivate);
    for (let i = 1; i < ends.length; i++) expect(ends[i]).toBeLessThan(ends[i - 1]);
  });
  it("the default assumptions land near the paper's published balances ($2.8M and $3.3M)", () => {
    const r = projectRetirement(base);
    expect(r.endPublicOnly / 1e6).toBeCloseTo(2.8, 1);
    expect(r.endWithPrivate / 1e6).toBeCloseTo(3.3, 1);
    expect(r.years).toHaveLength(41);
  });
  it("the premium table agrees with the model: 0% premium means no difference", () => {
    const t = premiumSensitivity(base);
    expect(t[0].difference).toBeCloseTo(0, 6);
    expect(t.map((x) => x.difference)).toEqual([...t.map((x) => x.difference)].sort((x, y) => x - y));
    expect(t[2].difference).toBeCloseTo(projectRetirement({ ...base, premiumPct: { privateEquity: 2, privateRealAssets: 2, privateCredit: 2 } }).difference, 6);
  });
});

describe("paper defaults", () => {
  it("carry every worker assumption from the paper (p. 9), with no extra fees", () => {
    for (const [k, v] of Object.entries(MODEL.assumptions)) expect(PAPER_DEFAULTS[k as keyof typeof MODEL.assumptions]).toBe(v.value);
    expect(PAPER_DEFAULTS.privateFeePct).toBe(0);
    expect(PAPER_DEFAULTS.rows).toBe(GLIDE.rows);
  });
});

describe("short money labels", () => {
  it("rounds before choosing the unit, and has a billions step", async () => {
    const { short, signed } = await import("@/lib/addons/retirement-plus/format");
    expect(short(499)).toBe("$0");
    expect(short(498_668)).toBe("$499k");
    expect(short(999_499)).toBe("$999k");
    expect(short(999_600)).toBe("$1.0M");
    expect(short(2_811_166)).toBe("$2.8M");
    expect(short(999_960_000)).toBe("$1.0B");
    expect(short(1_077_200_000)).toBe("$1.1B");
    expect(signed(-12_400)).toBe("−$12k");
    expect(short(Number.NaN)).toBe("—");
  });
});
