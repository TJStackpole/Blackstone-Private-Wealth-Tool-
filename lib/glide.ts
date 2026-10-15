import type { Mix, RetirementData } from "./types";

/** Straight-line blend between the far-from-retirement mix and the at-retirement mix. */
export function mixForYears(gp: RetirementData["glidePath"], years: number): Mix {
  const t = Math.min(1, Math.max(0, years / gp.farYears)); // 0 = at retirement, 1 = far away
  const lerp = (a: number, b: number) => Math.round((a + (b - a) * t) * 10) / 10;
  const mix = {
    stocks: lerp(gp.near.stocks, gp.far.stocks),
    bonds: lerp(gp.near.bonds, gp.far.bonds),
    cash: lerp(gp.near.cash, gp.far.cash),
    private: lerp(gp.near.private, gp.far.private),
  };
  // Rounding can drift by 0.1; push any drift into stocks so the bar always totals 100.
  const total = mix.stocks + mix.bonds + mix.cash + mix.private;
  mix.stocks = Math.round((mix.stocks + (100 - total)) * 10) / 10;
  return mix;
}

export function glideSeries(gp: RetirementData["glidePath"]): (Mix & { years: number })[] {
  const out: (Mix & { years: number })[] = [];
  for (let y = gp.farYears; y >= 0; y -= 1) out.push({ years: y, ...mixForYears(gp, y) });
  return out;
}
