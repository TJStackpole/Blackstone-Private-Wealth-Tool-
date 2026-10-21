/**
 * Liquidity Reserve check: how many years of spending the client's liquid assets cover without redeeming anything.
 * Returns Infinity when there's no spending to cover, and 0 when there are no liquid assets.
 */
export function yearsCovered(liquidAssets: number, annualSpending: number): number {
  const assets = Math.max(0, Number.isFinite(liquidAssets) ? liquidAssets : 0);
  const spend = Math.max(0, Number.isFinite(annualSpending) ? annualSpending : 0);
  if (spend === 0) return Infinity;
  return assets / spend;
}

/** Plain-language result, e.g. "About 2.5 years of spending covered without redeeming." */
export function reserveSentence(years: number): string {
  if (years === Infinity) return "With no spending to cover, there's no need to redeem for spending.";
  if (years <= 0) return "No liquid reserve: any spending would have to come from somewhere else, such as a redemption.";
  const rounded = years >= 10 ? Math.round(years) : Math.round(years * 10) / 10;
  if (years < 1) return `About ${Math.max(1, Math.round(years * 12))} months of spending covered without redeeming.`;
  return `About ${rounded} year${rounded === 1 ? "" : "s"} of spending covered without redeeming.`;
}
