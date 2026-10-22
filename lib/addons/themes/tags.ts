import type { FundCode } from "@/config/addons";
import type { AddonSource } from "@/lib/addons/shared/types";
import type { FundData } from "@/lib/types";
import { LAYERS } from "@/data/layers";
import { FUND_CODE } from "@/lib/addons/shared/funds";
import tags from "@/data/addons/themes/tags.json";

export interface Theme {
  id: string;
  label: string;
  description: string;
  /** Sector names exactly as each fund's own data file uses them. */
  sectors: Partial<Record<FundCode, string[]>>;
}

export const TAGS = tags as { asOf: string; sample: boolean; source: AddonSource; method: string; themes: Theme[] };
export const THEMES = TAGS.themes;

/** Each fund's data file, read from the map's own layer list (never edited). */
export const FUND_DATA: Record<FundCode, FundData> = Object.fromEntries(
  LAYERS.filter((l) => l.data && FUND_CODE[l.id]).map((l) => [FUND_CODE[l.id], l.data as FundData]),
) as Record<FundCode, FundData>;

export function findTheme(id: string | null): Theme | undefined {
  return THEMES.find((t) => t.id === id);
}

/** The tagged sectors in one fund, largest first, with their published share of the fund. */
export function themeSectors(theme: Theme, fund: FundCode, data: Record<FundCode, FundData> = FUND_DATA): { key: string; pct: number }[] {
  const keys = theme.sectors[fund] ?? [];
  const sectors = data[fund]?.sectors ?? [];
  return keys
    .map((k) => ({ key: k, pct: sectors.find((s) => s.key === k)?.pct ?? 0 }))
    .sort((a, b) => b.pct - a.pct);
}

/** The sector the map filters to for a theme: the fund's largest tagged sector, or null if the theme isn't in that fund. */
export function primarySector(theme: Theme, fund: FundCode, data: Record<FundCode, FundData> = FUND_DATA): string | null {
  return themeSectors(theme, fund, data)[0]?.key ?? null;
}

/** Share of a fund in a theme, in percent: the sum of its tagged sectors' published weights. */
export function themeWeight(theme: Theme, fund: FundCode, data: Record<FundCode, FundData> = FUND_DATA): number {
  return Math.round(themeSectors(theme, fund, data).reduce((s, x) => s + x.pct, 0) * 10) / 10;
}
