import type { Mix, RetirementData } from "./types";

/**
 * Straight-line blend between the at-retirement mix and the far-from-retirement mix,
 * rounded to whole percents that always add up to exactly 100.
 * The table, tooltip, chart and screen-reader text all read these same numbers.
 */
export function mixForYears(
  gp: RetirementData["glidePath"],
  years: number,
): Mix {
  const t = Math.min(1, Math.max(0, years / gp.farYears)); // 0 = at retirement, 1 = far away
  const lerp = (a: number, b: number) => a + (b - a) * t;
  const mix: Mix = {
    stocks: Math.round(lerp(gp.near.stocks, gp.far.stocks)),
    bonds: Math.round(lerp(gp.near.bonds, gp.far.bonds)),
    cash: Math.round(lerp(gp.near.cash, gp.far.cash)),
    private: Math.round(lerp(gp.near.private, gp.far.private)),
  };
  // Rounding can push the total to 99 or 101; absorb the difference in stocks, the largest slice.
  mix.stocks += 100 - (mix.stocks + mix.bonds + mix.cash + mix.private);
  return mix;
}

/** Unrounded blend, used only to draw smooth chart bands. Numbers shown on screen come from mixForYears. */
function exactMix(gp: RetirementData["glidePath"], years: number): Mix {
  const t = Math.min(1, Math.max(0, years / gp.farYears));
  const lerp = (a: number, b: number) => a + (b - a) * t;
  return {
    stocks: lerp(gp.near.stocks, gp.far.stocks),
    bonds: lerp(gp.near.bonds, gp.far.bonds),
    cash: lerp(gp.near.cash, gp.far.cash),
    private: lerp(gp.near.private, gp.far.private),
  };
}

/** One point per whole year, from retirement (0) out to farYears, for drawing the chart. */
export function glideSeries(
  gp: RetirementData["glidePath"],
): (Mix & { years: number })[] {
  const out: (Mix & { years: number })[] = [];
  for (let y = 0; y <= gp.farYears; y += 1)
    out.push({ years: y, ...exactMix(gp, y) });
  return out;
}
